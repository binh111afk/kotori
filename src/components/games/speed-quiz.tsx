"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { shuffle, sample } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { SpeakButton } from "@/components/study/speak-button";
import { cn } from "@/lib/cn";

export interface SpeedQuizQuestion {
  id: string;
  itemType: "kana" | "vocab";
  prompt: string;
  speak?: string;
  options: string[];
  answerIndex: number;
}

export interface SpeedQuizSource {
  kana: { char: string; romaji: string }[];
  vocab: { id: string; kana: string; meaning_vi: string }[];
}

// ponytail: Math.random chỉ xáo thứ tự câu hỏi — không dùng cho mục đích bảo mật
function buildQuestions(src: SpeedQuizSource): SpeedQuizQuestion[] {
  const out: SpeedQuizQuestion[] = [];
  for (const k of sample(src.kana, 14)) {
    const others = sample(src.kana.filter((o) => o.romaji !== k.romaji), 3);
    if (others.length < 3) continue;
    const options = shuffle([k.romaji, ...others.map((o) => o.romaji)]);
    out.push({
      id: `kana-${k.char}`,
      itemType: "kana",
      prompt: k.char,
      speak: k.char,
      options,
      answerIndex: options.indexOf(k.romaji),
    });
  }
  for (const w of sample(src.vocab, 10)) {
    const others = sample(src.vocab.filter((o) => o.id !== w.id), 3);
    if (others.length < 3) continue;
    const options = shuffle([w.meaning_vi, ...others.map((o) => o.meaning_vi)]);
    out.push({
      id: w.id,
      itemType: "vocab",
      prompt: w.kana,
      speak: w.kana,
      options,
      answerIndex: options.indexOf(w.meaning_vi),
    });
  }
  return shuffle(out);
}

export function SpeedQuizGame({
  title,
  source,
  userId,
}: {
  title: string;
  source: SpeedQuizSource;
  userId: string;
}) {
  const questions = useMemo(() => buildQuestions(source), [source]);
  return <SpeedQuiz title={title} questions={questions} userId={userId} />;
}

const SECONDS_PER_QUESTION = 6;
const COMBO_CAP = 5;

export function SpeedQuiz({
  title,
  questions,
  userId,
}: {
  title: string;
  questions: SpeedQuizQuestion[];
  userId: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);

  const comboRef = useRef(0);
  const correctRef = useRef(0);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const wrongRef = useRef<{ id: string; itemType: "kana" | "vocab" }[]>([]);

  const q = questions[index];
  const answered = chosen !== null;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    void recordStudyEvent({
      kind: "game",
      itemType: questions[0]?.itemType ?? null,
      correct: correctRef.current,
      total: questions.length,
    })
      .then(setXpResult)
      .catch(() => {});
    void recordWrongAnswers(
      userId,
      wrongRef.current.map((w) => ({ itemType: w.itemType, itemId: w.id })),
    );
  }, [questions, userId]);

  const advance = useCallback(() => {
    if (index + 1 >= questions.length) {
      finish();
    } else {
      setIndex((i) => i + 1);
      setChosen(null);
      setTimeLeft(SECONDS_PER_QUESTION);
    }
  }, [index, questions.length, finish]);

  function answer(i: number | null) {
    if (doneRef.current || chosen !== null) return;
    setChosen(i ?? -1);
    const ok = i === q.answerIndex;
    if (ok) {
      comboRef.current += 1;
      correctRef.current += 1;
      const multiplier = Math.min(COMBO_CAP, comboRef.current);
      scoreRef.current += 10 * multiplier;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setCorrect(correctRef.current);
    } else {
      comboRef.current = 0;
      setCombo(0);
      wrongRef.current = [...wrongRef.current, { id: q.id, itemType: q.itemType }];
    }
  }

  // đồng hồ đếm ngược từng câu
  useEffect(() => {
    if (done || chosen !== null) return;
    const t = setInterval(() => {
      setTimeLeft((s) => Math.max(0, +(s - 0.1).toFixed(1)));
    }, 100);
    return () => clearInterval(t);
  }, [index, chosen, done]);

  useEffect(() => {
    if (!done && chosen === null && timeLeft <= 0) {
      answer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, chosen, done]);

  function restart() {
    doneRef.current = false;
    comboRef.current = 0;
    correctRef.current = 0;
    scoreRef.current = 0;
    wrongRef.current = [];
    setIndex(0);
    setChosen(null);
    setScore(0);
    setCombo(0);
    setCorrect(0);
    setXpResult(null);
    setTimeLeft(SECONDS_PER_QUESTION);
    setDone(false);
  }

  if (done) {
    return (
      <GameFinish
        gameName={title}
        outcome={{ score, correct, total: questions.length }}
        xpResult={xpResult}
        onReplay={restart}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-3 flex items-center justify-between rounded-3xl border border-border bg-surface px-5 py-3 shadow-soft">
        <GameStat label="Điểm" value={score} tone="butter" />
        <p className="text-xs text-muted">
          Câu {index + 1}/{questions.length}
        </p>
        <GameStat label="Combo" value={`×${Math.min(COMBO_CAP, combo)}`} tone="mint" />
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className={cn("h-full rounded-full", timeLeft > 2 ? "bg-secondary" : "bg-danger")}
          initial={false}
          animate={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      <motion.div
        key={index}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-surface p-6 text-center shadow-soft"
      >
        <p className="font-jp text-5xl font-bold">{q.prompt}</p>
        {q.speak && <SpeakButton text={q.speak} size={16} className="mt-3 [&>button]:size-8" />}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {q.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onClick={() => answer(i)}
              disabled={chosen !== null}
              className={cn(
                "rounded-2xl border px-3 py-3.5 font-semibold transition-colors",
                chosen !== null && i === q.answerIndex
                  ? "border-mint-vivid bg-mint-soft text-mint"
                  : chosen === i
                    ? "border-danger bg-danger-soft text-danger-text"
                    : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span className="font-jp">{opt}</span>
            </button>
          ))}
        </div>
        {chosen !== null && chosen !== q.answerIndex && (
          <p className="mt-3 text-sm text-danger-text">
            Đáp án đúng: <span className="font-jp font-bold">{q.options[q.answerIndex]}</span>
          </p>
        )}
      </motion.div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => (chosen !== null ? advance() : answer(null))}
          className="rounded-full bg-surface-2 px-5 py-2 text-xs font-semibold text-muted hover:text-foreground"
        >
          {chosen !== null ? "Câu tiếp theo →" : "Bỏ qua (tính sai)"}
        </button>
      </div>
    </div>
  );
}
