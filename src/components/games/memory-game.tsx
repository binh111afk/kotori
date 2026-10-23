"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { sample, shuffle } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { cn } from "@/lib/cn";
import type { GameItem } from "@/components/games/match-game";

const PAIRS = 8;

interface Card {
  key: string;
  pairIndex: number;
  side: "jp" | "vi";
  text: string;
  jp?: string;
  id?: string;
  itemType?: "kana" | "vocab";
}

export function MemoryGame({
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
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [wrongItems, setWrongItems] = useState<GameItem[]>([]);

  const cards = useMemo<Card[]>(() => {
    const chosen = sample(items, PAIRS);
    const deck: Card[] = [];
    chosen.forEach((it, pairIndex) => {
      deck.push({ key: `${pairIndex}-jp`, pairIndex, side: "jp", text: it.jp, jp: it.jp, id: it.id, itemType: it.itemType });
      deck.push({ key: `${pairIndex}-vi`, pairIndex, side: "vi", text: it.vi });
    });
    return shuffle(deck);
  }, [round, items]);

  const [flipped, setFlipped] = useState<Card[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [round]);

  function restart() {
    setRound((r) => r + 1);
    setDone(false);
    setXpResult(null);
    setWrongItems([]);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setMistakes(0);
    setSeconds(0);
  }

  function flip(card: Card) {
    if (matched.includes(card.pairIndex) || flipped.some((f) => f.key === card.key) || flipped.length === 2) return;
    const next = [...flipped, card];
    setFlipped(next);
    if (next.length < 2) return;

    const [a, b] = next;
    setMoves((m) => m + 1);
    if (a.pairIndex === b.pairIndex) {
      const nextMatched = [...matched, a.pairIndex];
      setMatched(nextMatched);
      setFlipped([]);
      if (nextMatched.length === PAIRS) {
        finish();
      }
    } else {
      setMistakes((m) => m + 1);
      const wrong = items.find((it) => it.id === (a.id ?? b.id));
      if (wrong) setWrongItems((w) => (w.some((x) => x.id === wrong.id) ? w : [...w, wrong]));
      setTimeout(() => setFlipped([]), reduce ? 300 : 800);
    }
  }

  function finish() {
    setDone(true);
    // xp: mỗi cặp 1 câu; hơn 3 lần lật sai → mỗi 3 lỗi trừ 1 "câu đúng"
    const correct = Math.max(0, PAIRS - Math.floor(mistakes / 3));
    void recordStudyEvent({ kind: "game", itemType: items[0]?.itemType ?? null, correct, total: PAIRS })
      .then(setXpResult)
      .catch(() => {});
    void recordWrongAnswers(userId, wrongItems.map((w) => ({ itemType: w.itemType, itemId: w.id })));
  }

  if (done) {
    const correct = Math.max(0, PAIRS - Math.floor(mistakes / 3));
    return (
      <GameFinish
        gameName={title}
        outcome={{ score: Math.max(0, 100 - mistakes * 5), correct, total: PAIRS }}
        xpResult={xpResult}
        onReplay={restart}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between rounded-3xl border border-border bg-surface px-5 py-3 shadow-soft">
        <GameStat label="Lượt lật" value={moves} />
        <p className="text-xs text-muted">Tìm {PAIRS} cặp giống nhau</p>
        <GameStat label="Sai" value={mistakes} tone="danger" />
        <GameStat label="Giây" value={seconds} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const isOpen = flipped.some((f) => f.key === card.key) || matched.includes(card.pairIndex);
          const isMatched = matched.includes(card.pairIndex);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => flip(card)}
              aria-label={isOpen ? card.text : "Thẻ úp"}
              className="[perspective:800px]"
            >
              <motion.div
                className="relative w-full [transform-style:preserve-3d]"
                animate={{ rotateY: isOpen ? 180 : 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
                style={{ aspectRatio: "3 / 4" }}
              >
                <div
                  className={cn(
                    "absolute inset-0 grid place-items-center rounded-2xl border [backface-visibility:hidden]",
                    "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  <span className="font-jp text-2xl font-bold">こ</span>
                </div>
                <div
                  className={cn(
                    "absolute inset-0 grid place-items-center rounded-2xl border p-1 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    isMatched
                      ? "border-mint-vivid bg-mint-soft text-mint"
                      : card.side === "jp"
                        ? "border-border bg-surface font-jp text-base font-bold"
                        : "border-border bg-surface text-xs font-semibold sm:text-sm",
                  )}
                >
                  {card.text}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Lật 2 thẻ cùng một cặp. Ít lần sai hơn → nhiều XP hơn.
      </p>
    </div>
  );
}
