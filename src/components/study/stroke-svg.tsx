"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowClockwise } from "@phosphor-icons/react";
import strokesData from "@/content/kana-strokes.json";
import kanjiStrokesData from "@/content/kanji-strokes.json";
import { cn } from "@/lib/cn";

const ALL_STROKES = { ...strokesData, ...kanjiStrokesData } as Record<string, { strokes: string[] }>;

// Nguồn: KanjiVG (© Ulrich Apel, CC BY-SA 3.0) — hệ toạ độ viewBox 0 0 109 109, nét ~3px.
export function StrokeSvg({
  char,
  size = 130,
  className,
}: {
  char: string;
  size?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const gradientId = useId();
  const [run, setRun] = useState(0);
  const paths = ALL_STROKES[char]?.strokes ?? [];

  if (!paths.length) {
    return (
      <span style={{ fontSize: size }} className={cn("grid place-items-center font-jp", className)}>
        {char}
      </span>
    );
  }

  return (
    <div className={cn("relative inline-grid place-items-center", className)}>
      <svg viewBox="0 0 109 109" width={size} height={size} role="img" aria-label={`Thứ tự nét: ${char}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary-hover)" />
          </linearGradient>
        </defs>
        {/* lưới hướng dẫn mờ */}
        <line x1="54.5" y1="4" x2="54.5" y2="105" stroke="var(--border)" strokeWidth="1" />
        <line x1="4" y1="54.5" x2="105" y2="54.5" stroke="var(--border)" strokeWidth="1" />
        {paths.map((d, i) => (
          <motion.path
            key={`${run}-${i}`}
            d={d}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : { pathLength: { delay: i * 0.45, duration: 0.5, ease: "easeOut" }, opacity: { delay: i * 0.45, duration: 0.05 } }
            }
          />
        ))}
      </svg>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        aria-label="Vẽ lại từng nét"
        className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-surface-2 text-muted shadow-soft transition-transform hover:scale-105 active:scale-95"
      >
        <ArrowClockwise size={14} weight="duotone" />
      </button>
    </div>
  );
}
