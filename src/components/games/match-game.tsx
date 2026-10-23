"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { shuffle, sample } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { cn } from "@/lib/cn";

export interface GameItem {
  /** Mặt tiếng Nhật (kana/kanji). */
  jp: string;
  /** Mặt nghĩa tiếng Việt hoặc romaji. */
  vi: string;
  /** id để đẩy SRS khi sai. */
  id: string;
  itemType: "kana" | "vocab";
  speak?: string;
}

const PAIRS = 6;

export function MatchGame({
  title,
  items,
  userId,
}: {
  title: string;
  items: GameItem[];
  userId: string;
}) {
  const reduce = useReducedMotion();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [wrongItems, setWrongItems] = useState<GameItem[]>([]);

  const pairs = useMemo(() => sample(items, PAIRS), [round, items]);
  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);

  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [shakeRight, setShakeRight] = useState<number | null>(null);
  const [mistakeThisPair, setMistakeThisPair] = useState(false);
  const firstTryRef = useRef(0);

  function restart() {
    setRound((r) => r + 1);
    setScore(0);
    setFirstTry(0);
    setMistakes(0);
    setDone(false);
    setXpResult(null);
    setWrongItems([]);
    setSelLeft(null);
    setMatched([]);
    setMistakeThisPair(false);
    firstTryRef.current = 0;
  }

  function pickLeft(i: number) {
    if (matched.includes(i)) return;
    setSelLeft(i);
  }

  function pickRight(j: number) {
    if (matched.includes(j) || selLeft === null) return;
    if (selLeft === j) {
      const nextMatched = [...matched, j];
      setMatched(nextMatched);
      if (!mistakeThisPair) {
        setFirstTry((n) => n + 1);
        firstTryRef.current += 1;
      }
      setScore((s) => s + Math.max(0, 10 - mistakes * 2));
      setMistakeThisPair(false);
      if (nextMatched.length === pairs.length) {
        finishGame();
      }
    } else {
      setMistakes((m) => m + 1);
      setMistakeThisPair(true);
      setWrongItems((w) => (w.some((x) => x.id === pairs[j].id) ? w : [...w, pairs[j]]));
      setShakeRight(j);
      setTimeout(() => setShakeRight(null), 450);
    }
    setSelLeft(null);
  }

  function finishGame() {
    const total = pairs.length;
    setDone(true);
    void recordStudyEvent({
      kind: "game",
      itemType: pairs[0]?.itemType ?? null,
      correct: firstTryRef.current,
      total,
    })
      .then(setXpResult)
      .catch(() => {});
    void recordWrongAnswers(userId, wrongItems.map((w) => ({ itemType: w.itemType, itemId: w.id })));
  }

  if (done) {
    return (
      <GameFinish
        gameName={title}
        outcome={{ score, correct: firstTry, total: pairs.length }}
        xpResult={xpResult}
        onReplay={restart}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between rounded-3xl border border-border bg-surface px-5 py-3 shadow-soft">
        <GameStat label="Điểm" value={score} tone="butter" />
        <p className="text-xs text-muted">Nối {pairs.length} cặp · sai bớt điểm</p>
        <GameStat label="Lỗi" value={mistakes} tone="danger" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {left.map((it, i) => (
            <motion.button
              key={`${round}-l-${i}`}
              type="button"
              onClick={() => pickLeft(pairs.indexOf(it))}
              disabled={matched.includes(pairs.indexOf(it))}
              className={cn(
                "rounded-2xl border px-3 py-3.5 font-jp text-base transition-colors",
                matched.includes(pairs.indexOf(it))
                  ? "border-mint-vivid bg-mint-soft text-mint opacity-70"
                  : selLeft === pairs.indexOf(it)
                    ? "border-primary bg-primary-soft text-primary-text"
                    : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              {it.jp}
            </motion.button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {right.map((it, j) => (
            <motion.button
              key={`${round}-r-${j}`}
              type="button"
              onClick={() => pickRight(pairs.indexOf(it))}
              disabled={matched.includes(pairs.indexOf(it))}
              animate={shakeRight === pairs.indexOf(it) ? { x: [0, -7, 7, -5, 5, 0] } : {}}
              transition={reduce ? { duration: 0 } : { duration: 0.4 }}
              className="rounded-2xl border border-border bg-surface px-3 py-3.5 text-left text-sm transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              {it.vi}
            </motion.button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Cột trái tiếng Nhật · cột phải nghĩa. Nối chuẩn lần đầu được nhiều điểm nhất.
      </p>
    </div>
  );
}

export function buildMatchItems(
  kana: { char: string; romaji: string }[],
  vocab: { id: string; kana: string; meaning_vi: string }[],
  source: "kana" | "vocab",
): GameItem[] {
  if (source === "kana") {
    return sample(kana, PAIRS).map((k) => ({
      id: k.char,
      itemType: "kana" as const,
      jp: k.char,
      vi: k.romaji,
      speak: k.char,
    }));
  }
  return sample(vocab, PAIRS).map((w) => ({
    id: w.id,
    itemType: "vocab" as const,
    jp: w.kana,
    vi: w.meaning_vi,
    speak: w.kana,
  }));
}
