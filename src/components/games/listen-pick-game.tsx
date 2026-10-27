"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { shuffle, sample } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { SpeakButton } from "@/components/study/speak-button";
import { cn } from "@/lib/cn";

interface Item { jp: string; romaji: string; id: string }
interface Round { answer: string; romaji: string; options: string[]; speak: string; id: string }

export function ListenPickGame({ title, items, userId }: {
  title: string;
  items: { jp: string; romaji: string; id: string }[];
  userId: string;
}) {
  const reduce = useReducedMotion();
  const rounds = useMemo<Round[]>(() => {
    return shuffle(items).slice(0, 12).map((it) => {
      const others = shuffle(items.filter((o) => o.jp !== it.jp)).slice(0, 3).map((o) => o.jp);
      const options = shuffle([it.jp, ...others]);
      return { answer: it.jp, romaji: it.romaji, options, speak: it.jp, id: it.id };
    });
  }, [items]);

  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const r = rounds[idx];
  const answered = chosen !== null;
  const isRight = chosen === r?.answer;


  function pick(opt: string) {
    if (answered) return;
    setChosen(opt);
    if (opt === r.answer) {
      setCorrect((c) => c + 1);
      setScore((s) => s + 10);
    } else {
      setWrongIds((w) => [...w, r.id]);
    }
  }

  function next() {
    if (idx + 1 >= rounds.length) {
      setDone(true);
      void recordStudyEvent({ kind: "game", itemType: "kana", correct, total: rounds.length })
        .then(setXpResult).catch(() => {});
      void recordWrongAnswers(userId, wrongIds.map((id) => ({ itemType: "kana" as const, itemId: id })));
    } else {
      setIdx((i) => i + 1);
      setChosen(null);
    }
  }

  function restart() { setIdx(0); setChosen(null); setCorrect(0); setScore(0); setDone(false); setXpResult(null); setWrongIds([]); }

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

      <div className="rounded-3xl border border-border bg-surface p-6 text-center shadow-soft">
        <p className="text-sm font-semibold text-muted">Nghe và chọn đúng chữ:</p>
        <div className="mt-4 flex justify-center">
          <SpeakButton text={r.speak} slow size={28} className="[&>button]:size-14 [&>button]:text-2xl" />
        </div>
        <p className="mt-3 text-xs text-muted">Bấm nút loa để nghe lại</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {r.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => pick(opt)}
            disabled={answered}
            className={cn(
              "rounded-2xl border px-4 py-4 font-jp text-2xl font-bold transition-colors",
              answered && opt === r.answer
                ? "border-mint-vivid bg-mint-soft text-mint"
                : answered && opt === chosen
                  ? "border-danger bg-danger-soft text-danger-text"
                  : "border-border bg-surface hover:bg-surface-2",
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-4 text-center">
          <p className={cn("text-sm font-bold", isRight ? "text-mint" : "text-danger-text")}>
            {isRight ? "Đúng!" : `Đáp án: ${r.answer} (${r.romaji})`}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft"
          >
            {idx + 1 >= rounds.length ? "Xem kết quả" : "Câu tiếp theo →"}
          </button>
        </div>
      )}
    </div>
  );
}
