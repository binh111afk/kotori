"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { shuffle, sample } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { cn } from "@/lib/cn";

const SEQ_LENGTH_START = 3;
const SEQ_LENGTH_MAX = 7;
const SHOW_MS = 800;

export function SequenceGame({ title, kanaChars, userId }: {
  title: string;
  kanaChars: { char: string; romaji: string; id: string }[];
  userId: string;
}) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showing, setShowing] = useState(true);
  const [current, setCurrent] = useState<string | null>(null);
  const [seq, setSeq] = useState<string[]>([]);
  const [tapped, setTapped] = useState<string[]>([]);
  const pool = useRef(shuffle(kanaChars));
  const seqRef = useRef<string[]>([]);
  const tapIdxRef = useRef(0);

  const newRound = useCallback(() => {
    const len = Math.min(SEQ_LENGTH_MAX, SEQ_LENGTH_START + Math.floor(round / 2));
    const chars = sample(pool.current, len);
    seqRef.current = chars.map((c) => c.char);
    setSeq(chars.map((c) => c.char));
    tapIdxRef.current = 0;
    setTapped([]);
    setShowing(true);
    // Từng chữ hiện lên rồi ẩn đi
    let i = 0;
    const show = () => {
      if (i >= seqRef.current.length) {
        setTimeout(() => setShowing(false), SHOW_MS);
        return;
      }
      setCurrent(seqRef.current[i]);
      setTimeout(() => { i++; show(); }, SHOW_MS);
    };
    setCurrent(null);
    setTimeout(show, 600);
  }, [round]);

  useEffect(() => { newRound(); }, [newRound]);

  const grid = useMemo(() => shuffle(kanaChars).slice(0, 12).map((k: { char: string }) => k.char), [kanaChars]);

  function tap(char: string) {
    if (showing || done) return;
    if (seqRef.current[tapIdxRef.current] === char) {
      setTapped((t) => [...t, char]);
      tapIdxRef.current += 1;
      if (tapIdxRef.current >= seqRef.current.length) {
        const newScore = score + seqRef.current.length * 5;
        setScore(newScore);
        setRound((r) => r + 1);
        setTimeout(newRound, 600);
      }
    } else {
      setDone(true);
      void recordStudyEvent({ kind: "game", itemType: "kana", correct: score / 5, total: seqRef.current.length })
        .then(setXpResult).catch(() => {});
    }
  }

  function restart() {
    pool.current = shuffle(kanaChars);
    setScore(0); setRound(0); setDone(false); setXpResult(null);
    setTimeout(newRound, 100);
  }

  if (done) {
    return <GameFinish gameName={title} outcome={{ score, correct: score / 5, total: seqRef.current.length }} xpResult={xpResult} onReplay={restart} />;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-3 flex items-center justify-between rounded-3xl border border-border bg-surface px-5 py-3 shadow-soft">
        <GameStat label="Điểm" value={score} tone="butter" />
        <p className="text-xs text-muted">Vòng {round + 1}</p>
        <GameStat label="Độ dài" value={seq.length} tone="mint" />
      </div>
      <div className="relative grid min-h-40 place-items-center rounded-3xl border border-border bg-surface p-6 shadow-soft">
        {showing ? (
          <motion.div
            key={current ?? "wait"}
            initial={reduce ? {} : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <p className="font-jp text-6xl font-bold text-primary-text">{current ?? "…"}</p>
            <p className="mt-2 text-xs text-muted">Nhớ thứ tự!</p>
          </motion.div>
        ) : (
          <p className="text-sm text-muted">Bấm theo thứ tự vừa hiện!</p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {grid.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => tap(char)}
            disabled={showing}
            className={cn(
              "rounded-2xl border border-border bg-surface py-4 font-jp text-2xl font-bold transition-transform hover:scale-105 active:scale-95",
              showing && "opacity-30",
              tapped.includes(char) && "border-mint-vivid bg-mint-soft text-mint",
            )}
          >
            {char}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted">Nhớ thứ tự chữ kana hiện lên rồi bấm lại theo đúng thứ tự!</p>
    </div>
  );
}
