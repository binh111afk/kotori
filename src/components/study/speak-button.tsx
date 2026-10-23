"use client";

import { useEffect, useState, useTransition } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { speech, type SpeechInfo } from "@/lib/audio/speech";
import { cn } from "@/lib/cn";

export function useSpeech() {
  const [info, setInfo] = useState<SpeechInfo>(() => speech.info());
  useEffect(() => {
    speech.start();
    setInfo(speech.info());
    return speech.subscribe(setInfo);
  }, []);
  return {
    ...info,
    speak: (text: string, rate?: number) => speech.speak(text, { rate }),
    stop: () => speech.stop(),
  };
}

export function SpeechNotice({ className }: { className?: string }) {
  const { supported, ready, hasJapanese } = useSpeech();
  if (!supported) {
    return (
      <p className={cn("rounded-2xl bg-butter-soft px-4 py-3 text-sm text-butter", className)}>
        Trình duyệt này chưa hỗ trợ phát âm. Bạn vẫn học được bình thường, nhưng muốn
        nghe tiếng Nhật thì dùng Chrome, Edge hoặc Safari nhé.
      </p>
    );
  }
  if (!ready || hasJapanese) return null;
  return (
    <p className={cn("rounded-2xl bg-butter-soft px-4 py-3 text-sm text-butter", className)}>
      Máy của bạn chưa cài giọng tiếng Nhật nên chưa nghe được. Cài thêm rồi tải lại
      trang nhé: Windows (Cài đặt → Thời gian &amp; ngôn ngữ → Giọng nói → Thêm giọng →
      日本語), Android (Cài đặt Google Text-to-Speech), iOS/macOS có sẵn tiếng Nhật.
    </p>
  );
}

export function SpeakButton({
  text,
  slow = false,
  size = 20,
  className,
}: {
  text: string;
  /** Hiện thêm nút đọc chậm. */
  slow?: boolean;
  size?: number;
  className?: string;
}) {
  const { supported, ready, hasJapanese, speak } = useSpeech();
  const [pending, startTransition] = useTransition();
  const disabled = !supported || (ready && !hasJapanese) || pending;

  const play = (rate?: number) =>
    startTransition(async () => {
      try {
        await speak(text, rate);
      } catch {
        // im lặng: nút bấm không được phá trải nghiệm
      }
    });

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => play(1)}
        disabled={disabled}
        aria-label={`Nghe: ${text}`}
        className={cn(
          "grid size-10 place-items-center rounded-full bg-primary-soft text-primary-text transition-transform hover:brightness-95 active:scale-95 disabled:opacity-40",
          slow && "size-9",
        )}
      >
        {supported ? <SpeakerHigh size={size} weight="duotone" /> : <SpeakerSlash size={size} weight="duotone" />}
      </button>
      {slow && (
        <button
          type="button"
          onClick={() => play(0.7)}
          disabled={disabled}
          aria-label={`Nghe chậm: ${text}`}
          className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition-transform hover:brightness-95 active:scale-95 disabled:opacity-40"
        >
          Chậm
        </button>
      )}
    </span>
  );
}
