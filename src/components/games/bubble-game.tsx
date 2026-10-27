"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { shuffle } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { cn } from "@/lib/cn";

interface Bubble {
  uid: number;
  jp: string;
  vi: string;
  id: string;
  x: number;
  y: number;
}

const BUBBLES = 8;
const ROUNDS = 5;

export function BubbleGame({ title, items, userId }: {
  title: string;
  items: { jp: string; vi: string; id: string }[];
  userId: string;
}) {
  const reduce = useReducedMotion();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [prompt, setPrompt] = useState<{ jp: string; vi: string; id: string } | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const pool = useRef(shuffle(items));
  const firstTry = useRef(0);
  const wrongThis = useRef(false);

  const newRound = useCallback(() => {
    if (pool.current.length < BUBBLES) pool.current = shuffle(items);
    const chosen = pool.current.splice(0, BUBBLES);
    const target = chosen[Math.floor(Math.random() * BUBBLES)];
    setBubbles(chosen.map((it, i) => ({
      uid: Date.now() + i,
      jp: it.jp, vi: it.vi, id: it.id,
      x: 8 + (i % 4) * 22 + Math.random() * 10,
      y: 10 + Math.floor(i / 4) * 40 + Math.random() * 15,
    })));
    setPrompt(target);
    wrongThis.current = false;
  }, [items]);

  useEffect(() => { newRound(); }, [newRound]);

  function tap(b: Bubble) {
    if (!prompt) return;
    if (b.jp === prompt.jp) {
      if (!wrongThis.current) firstTry.current += 1;
      setScore((s) => s + 10);
      setBubbles((cur) => cur.filter((x) => x.uid !== b.uid));
      if (bubbles.length <= 1) {
        setBubbles([]);
        if (round + 1 >= ROUNDS) {
          setDone(true);
          void recordStudyEvent({ kind: "game", itemType: "vocab", correct: firstTry.current, total: ROUNDS })
            .then(setXpResult).catch(() => {});
          void recordWrongAnswers(userId, wrong.map((id) => ({ itemType: "vocab" as const, itemId: id })));
        } else {
          setRound((r) => r + 1);
          setTimeout(newRound, 300);
        }
      }
    } else {
      wrongThis.current = true;
      setWrong((w) => (w.includes(b.id) ? w : [...w, b.id]));
    }
  }

  function restart() {
    pool.current = shuffle(items);
    firstTry.current = 0;
    setScore(0); setDone(false); setXpResult(null); setWrong([]); setRound(0);
    firstTry.current = 0;
    setTimeout(newRound, 100);
  }

  if (done) {
    return <GameFinish gameName={title} outcome={{ score, correct: firstTry.current, total: ROUNDS }} xpResult={xpResult} onReplay={restart} />;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-3 flex items-center justify-between rounded-3xl border border-border bg-surface px-5 py-3 shadow-soft">
        <GameStat label="Điểm" value={score} tone="butter" />
        <p className="text-xs text-muted">Vòng {round + 1}/{ROUNDS}</p>
        <GameStat label="Còn" value={bubbles.length} tone="mint" />
      </div>
      <div className="rounded-3xl bg-primary-soft px-5 py-4 text-center">
        <p className="text-sm text-muted">Bong bóng nào nghĩa là:</p>
        <p className="font-jp text-2xl font-bold text-primary-text">{prompt?.vi}</p>
      </div>
      <div className="relative mt-3 h-96 overflow-hidden rounded-3xl border border-border bg-surface-2">
        {bubbles.map((b) => (
          <motion.button
            key={b.uid}
            type="button"
            onClick={() => tap(b)}
            className={cn("absolute rounded-full border-2 border-border bg-surface px-3 py-2 font-jp text-sm font-bold shadow-soft transition-transform hover:scale-105 active:scale-95", wrong.includes(b.id) && "opacity-30")}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            animate={reduce ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
          >
            {b.jp}
          </motion.button>
        ))}
        {bubbles.length === 0 && (
          <p className="absolute inset-0 grid place-items-center text-sm text-muted">Đang nạp bong bóng mới…</p>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-muted">Bấm bong bóng chứa từ đúng với nghĩa trên.</p>
    </div>
  );
}
