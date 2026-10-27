"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { shuffle } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { cn } from "@/lib/cn";

interface SentenceData { tokens: string[]; translation: string; id: string }

export function SentenceGame({ title, sentences, userId }: {
  title: string;
  sentences: SentenceData[];
  userId: string;
}) {
  const reduce = useReducedMotion();
  const rounds = useMemo(() => shuffle(sentences).slice(0, 10), [sentences]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);

  const s = rounds[idx];
  const pool = useMemo(() => shuffle(s.tokens.map((t, i) => ({ text: t, poolIdx: i }))), [s]);
  const answered = picked.length === s.tokens.length;
  const built = picked.map((pi) => s.tokens[pi]).join("");
  const isRight = built === s.tokens.join("");

  function pick(i: number) {
    if (answered || picked.includes(i)) return;
    setPicked((p) => [...p, i]);
  }

  function check() {
    const ok = picked.map((pi) => s.tokens[pi]).join("") === s.tokens.join("");
    if (ok) { setCorrect((c) => c + 1); setScore((sc) => sc + 10); }
    else { setWrong((w) => [...w, s.id]); }
  }

  function next() {
    if (idx + 1 >= rounds.length) {
      setDone(true);
      void recordStudyEvent({ kind: "game", itemType: "vocab", correct, total: rounds.length })
        .then(setXpResult).catch(() => {});
      void recordWrongAnswers(userId, wrong.map((id) => ({ itemType: "vocab" as const, itemId: id })));
    } else {
      setIdx((i) => i + 1);
      setPicked([]);
    }
  }

  function restart() {
    setIdx(0); setPicked([]); setScore(0); setCorrect(0); setDone(false); setXpResult(null); setWrong([]);
  }

  if (done) {
    return <GameFinish gameName={title} outcome={{ score, correct, total: rounds.length }} xpResult={xpResult} onReplay={restart} />;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-3 flex items-center justify-between rounded-3xl border border-border bg-surface px-5 py-3 shadow-soft">
        <GameStat label="Điểm" value={score} tone="butter" />
        <p className="text-xs text-muted">Câu {idx + 1}/{rounds.length}</p>
        <GameStat label="Đúng" value={correct} tone="mint" />
      </div>
      <p className="mb-2 text-sm font-semibold text-muted">Nghĩa: {s.translation}</p>
      <div className="mb-4 flex min-h-14 flex-wrap items-center gap-1.5 rounded-2xl border border-dashed border-border bg-background p-3">
        {picked.length === 0 && <span className="text-sm text-muted/60">Bấm thẻ bên dưới để sắp xếp…</span>}
        {picked.map((pi, i) => (
          <button key={i} type="button" disabled={answered} onClick={() => setPicked((p) => p.filter((_, j) => j !== i))}
            className="rounded-xl bg-primary-soft px-3 py-1.5 font-jp text-lg">{s.tokens[pi]}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {pool.map((t, i) => (
          <button key={i} type="button" disabled={answered || picked.includes(t.poolIdx)} onClick={() => pick(t.poolIdx)}
            className={cn("rounded-xl border border-border bg-surface px-3 py-1.5 font-jp text-lg", picked.includes(t.poolIdx) && "opacity-30")}>
            {t.text}
          </button>
        ))}
      </div>
      {!answered ? (
        <button type="button" onClick={check} disabled={picked.length !== s.tokens.length}
          className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-40">
          Kiểm tra
        </button>
      ) : (
        <div className="mt-4 text-center">
          <p className={cn("text-sm font-bold", isRight ? "text-mint" : "text-danger-text")}>
            {isRight ? "Chính xác!" : "Chưa đúng. "}
            <span className="font-jp">{s.tokens.join("")}</span>
          </p>
          <button type="button" onClick={next}
            className="mt-3 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft">
            {idx + 1 >= rounds.length ? "Xem kết quả" : "Câu tiếp theo →"}
          </button>
        </div>
      )}
    </div>
  );
}
