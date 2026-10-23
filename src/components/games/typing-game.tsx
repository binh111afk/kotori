"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { shuffle } from "@/lib/games/random";
import { GameFinish, GameStat } from "@/components/games/game-finish";
import { cn } from "@/lib/cn";

export interface TypingItem {
  jp: string;
  romaji: string;
  id: string;
  itemType: "kana" | "vocab";
}

interface FallingWord extends TypingItem {
  uid: number;
  /** 0..1 — 1 là chạm đáy */
  progress: number;
  /** giây để rơi hết */
  duration: number;
}

const LIVES = 3;
const SPAWN_MS = 2200;
const FALL_SECONDS_START = 9;
const FALL_SECONDS_MIN = 4.5;

export function TypingGame({
  title,
  items,
  userId,
}: {
  title: string;
  items: TypingItem[];
  userId: string;
}) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [input, setInput] = useState("");
  const [falling, setFalling] = useState<FallingWord[]>([]);
  const [typedOk, setTypedOk] = useState(0);
  const [missed, setMissed] = useState(0);
  const [shake, setShake] = useState(false);

  // Nguồn dữ liệu thật nằm trong ref — state chỉ để render.
  const pool = useRef<TypingItem[]>([]);
  const fallingRef = useRef<FallingWord[]>([]);
  const livesRef = useRef(LIVES);
  const typedRef = useRef(0);
  const missedRef = useRef(0);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const missedItemsRef = useRef<TypingItem[]>([]);
  const startedAt = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  const syncFalling = () => setFalling(fallingRef.current.map((w) => ({ ...w })));

  const spawn = useCallback(() => {
    if (doneRef.current) return;
    if (fallingRef.current.length >= 4) return;
    if (pool.current.length === 0) pool.current = shuffle(items);
    const next = pool.current.shift();
    if (!next) return;
    const elapsed = (Date.now() - startedAt.current) / 1000;
    const duration = Math.max(FALL_SECONDS_MIN, FALL_SECONDS_START - elapsed * 0.06);
    fallingRef.current = [
      ...fallingRef.current,
      { ...next, uid: Date.now() + Math.floor(Math.random() * 1000), progress: 0, duration },
    ];
    syncFalling();
  }, [items]);

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    void recordStudyEvent({
      kind: "game",
      itemType: items[0]?.itemType ?? null,
      correct: typedRef.current,
      total: typedRef.current + missedRef.current,
    })
      .then(setXpResult)
      .catch(() => {});
    void recordWrongAnswers(
      userId,
      missedItemsRef.current.map((m) => ({ itemType: m.itemType, itemId: m.id })),
    );
  }, [items, userId]);

  useEffect(() => {
    inputRef.current?.focus();
    startedAt.current = Date.now();
    pool.current = shuffle(items);
    spawn();
    const spawnTimer = setInterval(spawn, SPAWN_MS);
    const tickTimer = setInterval(() => {
      if (doneRef.current) return;
      let missedNow = 0;
      const next: FallingWord[] = [];
      for (const w of fallingRef.current) {
        const progress = w.progress + 0.1 / w.duration;
        if (progress >= 1) {
          missedNow += 1;
          missedItemsRef.current.push({ jp: w.jp, romaji: w.romaji, id: w.id, itemType: w.itemType });
        } else {
          next.push({ ...w, progress });
        }
      }
      if (!missedNow) {
        fallingRef.current = next;
        syncFalling();
        return;
      }
      missedRef.current += missedNow;
      comboRef.current = 0;
      livesRef.current -= missedNow;
      fallingRef.current = next;
      setMissed(missedRef.current);
      setCombo(0);
      setLives(livesRef.current);
      syncFalling();
      if (livesRef.current <= 0) endGame();
    }, 100);
    return () => {
      clearInterval(spawnTimer);
      clearInterval(tickTimer);
    };
  }, [spawn, endGame, items]);

  function submit() {
    if (doneRef.current) return;
    const value = input.trim().toLowerCase();
    if (!value) return;
    setInput("");
    const hit = fallingRef.current.find((w) => w.romaji.toLowerCase() === value);
    if (!hit) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    fallingRef.current = fallingRef.current.filter((w) => w.uid !== hit.uid);
    syncFalling();
    comboRef.current += 1;
    typedRef.current += 1;
    scoreRef.current += 10 + Math.min(20, (comboRef.current - 1) * 2);
    setTypedOk(typedRef.current);
    setCombo(comboRef.current);
    setScore(scoreRef.current);
  }

  function restart() {
    doneRef.current = false;
    pool.current = shuffle(items);
    fallingRef.current = [];
    livesRef.current = LIVES;
    typedRef.current = 0;
    missedRef.current = 0;
    comboRef.current = 0;
    scoreRef.current = 0;
    missedItemsRef.current = [];
    startedAt.current = Date.now();
    setScore(0);
    setCombo(0);
    setLives(LIVES);
    setTypedOk(0);
    setMissed(0);
    setFalling([]);
    setXpResult(null);
    setDone(false);
    spawn();
  }

  if (done) {
    return (
      <GameFinish
        gameName={title}
        outcome={{ score, correct: typedOk, total: typedOk + missed }}
        xpResult={xpResult}
        onReplay={restart}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-3 flex items-center justify-between rounded-3xl border border-border bg-surface px-5 py-3 shadow-soft">
        <GameStat label="Điểm" value={score} tone="butter" />
        <GameStat label="Combo" value={`×${1 + Math.min(4, combo)}`} tone="mint" />
        <div className="flex gap-1" aria-label={`Còn ${lives} mạng`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <span
              key={i}
              className={cn("size-2.5 rounded-full", i < lives ? "bg-danger" : "bg-surface-2")}
            />
          ))}
        </div>
      </div>

      <div className="relative h-80 overflow-hidden rounded-3xl border border-border bg-surface-2">
        {reduce && (
          <p className="absolute inset-x-0 top-2 z-10 text-center text-[11px] text-muted">
            Chế độ giảm chuyển động: từ đứng yên tại chỗ cho tới khi rơi xong.
          </p>
        )}
        {falling.map((w) => (
          <motion.div
            key={w.uid}
            className="absolute inset-x-6 mx-auto w-fit rounded-2xl bg-surface px-4 py-2 font-jp text-xl font-bold shadow-soft"
            initial={false}
            animate={reduce ? { top: "20%" } : { top: `${8 + w.progress * 74}%` }}
            transition={{ duration: reduce ? 0 : 0.1, ease: "linear" }}
          >
            {w.jp}
          </motion.div>
        ))}
        {falling.length === 0 && (
          <p className="absolute inset-0 grid place-items-center px-8 text-center text-sm text-muted">
            Gõ cách đọc (romaji) của từ đang rơi rồi Enter. Hết 3 mạng là dừng!
          </p>
        )}
      </div>

      <motion.div
        className="mt-4 flex gap-2"
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-label="Gõ cách đọc romaji"
          placeholder="Gõ romaji rồi Enter…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 font-mono text-lg outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={submit}
          aria-label="Kiểm tra"
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform active:scale-95"
        >
          <ArrowRight size={20} weight="duotone" />
        </button>
      </motion.div>
      <p className="mt-3 text-center text-xs text-muted">
        Ví dụ: あ → a · はい → hai. Nhầm chỉ mất combo — từ chạm đáy mới mất mạng.
      </p>
    </div>
  );
}
