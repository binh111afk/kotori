"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FuriganaText, segmentsToPlain, type FuriganaSegment } from "@/components/study/furigana";
import { cn } from "@/lib/cn";

export interface DictEntry {
  jp: string;
  reading: string;
  meaning: string;
}

interface WordState {
  idx: number;
  reading: string;
  meaning: string;
}

/**
 * Hiển thị đoạn văn với furigana + tooltip tra từ.
 * Hover (desktop) hoặc bấm (mobile) vào một từ → hiện phiên âm + nghĩa.
 */
export function ReadingText({
  segments,
  dict,
  className,
}: {
  segments: FuriganaSegment[];
  dict: Map<string, DictEntry>;
  className?: string;
}) {
  const [active, setActive] = useState<WordState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function lookup(segment: FuriganaSegment, idx: number): WordState | null {
    const plain = segment.t.replace(/[。、！？「」（）\s]/g, "");
    // Tra trực tiếp segment
    const direct = dict.get(segment.t) ?? dict.get(plain);
    if (direct) {
      return { idx, reading: direct.reading || segment.r || "", meaning: direct.meaning };
    }
    // Tra qua furigana (nếu segment có reading riêng)
    if (segment.r) {
      const byReading = dict.get(segment.r);
      if (byReading) {
        return { idx, reading: segment.r, meaning: byReading.meaning };
      }
    }
    // Không có trong dict — chỉ hiện furigana sẵn có
    if (segment.r) {
      return { idx, reading: segment.r, meaning: "" };
    }
    return null;
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="font-jp text-lg leading-loose">
        {segments.map((seg, idx) => {
          const info = lookup(seg, idx);
          const isInteractive = !!info;
          const isActive = active?.idx === idx;

          if (!isInteractive) {
            return (
              <span key={idx} className="text-foreground/70">
                {seg.t}
              </span>
            );
          }

          return (
            <span key={idx} className="relative inline-block">
              <span
                role="button"
                tabIndex={0}
                onMouseEnter={() => setActive(info)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(isActive ? null : info)}
                onFocus={() => setActive(info)}
                onBlur={() => setActive(null)}
                className={cn(
                  "cursor-pointer transition-colors",
                  isActive
                    ? "text-primary-text underline decoration-primary decoration-2 underline-offset-4"
                    : "underline decoration-border decoration-dotted decoration-1 underline-offset-4 hover:text-primary-text",
                )}
              >
                {seg.t}
              </span>
              {/* Tooltip */}
              <AnimatePresence>
                {isActive && (info.reading || info.meaning) && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 z-50 mb-1 block w-max max-w-56 -translate-x-1/2 rounded-xl border border-border bg-surface px-3 py-2 text-center shadow-lift"
                  >
                    {info.reading && (
                      <span className="block font-jp text-sm font-bold text-secondary-text">
                        {info.reading}
                      </span>
                    )}
                    {info.meaning && (
                      <span className="block text-xs text-foreground">{info.meaning}</span>
                    )}
                    {!info.meaning && info.reading && (
                      <span className="block text-[10px] text-muted">—</span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Xây dựng dictionary tra từ từ vocabulary + vocab table. */
export function buildDict(
  lessonVocab: { jp: string; r?: string; vi: string }[],
  vocabRows: { kana: string; kanji: string | null; romaji: string; meaning_vi: string }[],
  kanjiRows: { char: string; meaning_vi: string; on_reading: string[]; kun_reading: string[] }[],
): Map<string, DictEntry> {
  const map = new Map<string, DictEntry>();

  // 1) Từ vựng chính của bài (ưu tiên cao nhất)
  for (const v of lessonVocab) {
    if (!map.has(v.jp)) map.set(v.jp, { jp: v.jp, reading: v.r ?? "", meaning: v.vi });
    // Thêm cả dạng hiragana nếu có
    if (v.r && !map.has(v.r)) map.set(v.r, { jp: v.jp, reading: v.r, meaning: v.vi });
  }

  // 2) Từ vựng từ bảng vocab (781 từ)
  for (const v of vocabRows) {
    if (!map.has(v.kana)) map.set(v.kana, { jp: v.kana, reading: v.romaji, meaning: v.meaning_vi });
    if (v.kanji && !map.has(v.kanji)) {
      map.set(v.kanji, { jp: v.kanji, reading: v.romaji, meaning: v.meaning_vi });
    }
  }

  // 3) Kanji đơn (tra từng chữ)
  for (const k of kanjiRows) {
    const reading = [k.on_reading[0], k.kun_reading[0]].filter(Boolean).join("・") || "";
    if (!map.has(k.char)) map.set(k.char, { jp: k.char, reading, meaning: k.meaning_vi });
  }

  return map;
}
