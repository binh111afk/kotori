"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeSlash, Gauge, PauseCircle, PlayCircle, Repeat } from "@phosphor-icons/react";
import { speech } from "@/lib/audio/speech";
import { FuriganaText, segmentsToPlain, type FuriganaSegment } from "@/components/study/furigana";
import { SpeechNotice } from "@/components/study/speak-button";
import { cn } from "@/lib/cn";

export interface DialogueLine {
  speaker: string;
  segments: FuriganaSegment[];
  vi: string;
}

/**
 * Player hội thoại dùng Web Speech (qua lớp AudioProvider):
 * phát tuần tự từng câu (highlight câu đang phát), nghe lại từng câu,
 * tốc độ chậm/thường, ẩn/hiện transcript + bản dịch.
 */
export function ListeningPlayer({ lines, title }: { lines: DialogueLine[]; title: string }) {
  const reduce = useReducedMotion();
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [rate, setRate] = useState<0.7 | 1>(1);
  const [showScript, setShowScript] = useState(false);
  const stopFlag = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  async function playAll() {
    stopFlag.current = false;
    setIsPlaying(true);
    try {
      for (let i = 0; i < lines.length; i++) {
        if (stopFlag.current) break;
        setPlayingIdx(i);
        await speech.speak(segmentsToPlain(lines[i].segments), { rate });
      }
    } catch {
      // giọng không có / lỗi TTS — dừng nhẹ nhàng
    }
    setPlayingIdx(null);
    setIsPlaying(false);
  }

  function stop() {
    stopFlag.current = true;
    speech.stop();
    setPlayingIdx(null);
    setIsPlaying(false);
  }

  async function replayLine(i: number) {
    stopFlag.current = true;
    try {
      await speech.speak(segmentsToPlain(lines[i].segments), { rate });
    } catch {}
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <SpeechNotice className="mb-4" />

      <div className="flex flex-wrap items-center gap-2">
        {isPlaying ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-4 py-2.5 text-sm font-bold text-danger-text"
            aria-label="Dừng phát"
          >
            <PauseCircle size={18} weight="duotone" /> Dừng
          </button>
        ) : (
          <button
            type="button"
            onClick={playAll}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-soft"
            aria-label="Nghe cả hội thoại"
          >
            <PlayCircle size={18} weight="duotone" /> Nghe cả bài
          </button>
        )}
        <button
          type="button"
          onClick={() => playAll()}
          disabled={isPlaying}
          aria-label="Nghe lại từ đầu"
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-semibold text-muted hover:text-foreground disabled:opacity-40"
        >
          <Repeat size={16} weight="duotone" /> Nghe lại
        </button>
        <button
          type="button"
          onClick={() => setRate((r) => (r === 1 ? 0.7 : 1))}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
            rate === 0.7 ? "bg-secondary-soft text-secondary-text" : "bg-surface-2 text-muted hover:text-foreground",
          )}
          aria-label={rate === 1 ? "Chuyển sang đọc chậm" : "Chuyển sang đọc thường"}
        >
          <Gauge size={16} weight="duotone" /> {rate === 1 ? "Thường" : "Chậm"}
        </button>
        <button
          type="button"
          onClick={() => setShowScript((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-semibold text-muted hover:text-foreground"
          aria-pressed={showScript}
        >
          {showScript ? <EyeSlash size={16} weight="duotone" /> : <Eye size={16} weight="duotone" />}
          {showScript ? "Ẩn transcript" : "Xem transcript"}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {lines.map((line, i) => {
          const active = playingIdx === i;
          return (
            <motion.div
              key={i}
              className={cn(
                "rounded-2xl border px-4 py-3 transition-colors",
                active ? "border-primary bg-primary-soft/50" : "border-transparent bg-surface-2/60",
              )}
              animate={reduce || !active ? {} : { scale: [1, 1.01, 1] }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={cn("text-xs font-bold", active ? "text-primary-text" : "text-muted")}>
                  {line.speaker}
                </p>
                {showScript && (
                  <button
                    type="button"
                    onClick={() => replayLine(i)}
                    className="text-[11px] font-semibold text-secondary-text underline decoration-dotted underline-offset-2"
                    aria-label={`Nghe lại câu của ${line.speaker}`}
                  >
                    nghe câu này
                  </button>
                )}
              </div>
              {showScript ? (
                <>
                  <FuriganaText segments={line.segments} className="font-jp text-lg leading-loose" />
                  <p className="mt-1 text-xs text-muted">{line.vi}</p>
                </>
              ) : (
                <p className="text-sm text-muted/70">••••••••••</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {!showScript && (
        <p className="mt-3 text-center text-xs text-muted">
          Nghe 2–3 lần rồi mới bật transcript — hiệu quả hơn nhiều đấy.
        </p>
      )}
      <p className="sr-only">Bài nghe: {title}</p>
    </div>
  );
}
