"use client";

import { useState } from "react";
import { CaretDown, WarningCircle } from "@phosphor-icons/react";
import { FuriganaText, segmentsToPlain } from "@/components/study/furigana";
import { SpeakButton } from "@/components/study/speak-button";
import { cn } from "@/lib/cn";

export interface GrammarPointData {
  id: string;
  title: string;
  structure: string;
  explanation_vi: string;
  mistakes_vi: string[];
  examples: { segments: { t: string; r?: string }[]; vi: string }[];
  source?: string;
}

export function GrammarLessons({ points }: { points: GrammarPointData[] }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {points.map((g) => (
        <GrammarCard key={g.id} point={g} />
      ))}
      {points.length === 0 && (
        <p className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-muted">
          Unit này chưa có bài ngữ pháp.
        </p>
      )}
    </div>
  );
}

function GrammarCard({ point }: { point: GrammarPointData }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div>
          <h3 className="font-bold leading-snug">{point.title}</h3>
          <p className="mt-1.5 inline-block rounded-full bg-primary-soft px-3 py-1 font-jp text-sm font-semibold text-primary-text">
            {point.structure}
          </p>
        </div>
        <CaretDown
          size={18}
          weight="duotone"
          className={cn("mt-1 shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-border p-5 pt-4">
          <p className="text-sm leading-relaxed text-foreground/90">{point.explanation_vi}</p>

          <div className="mt-4 space-y-2.5">
            {point.examples.map((e, i) => (
              <div key={i} className="rounded-2xl bg-surface-2 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <FuriganaText segments={e.segments} className="font-jp text-lg" />
                  <SpeakButton text={segmentsToPlain(e.segments)} size={16} className="[&>button]:size-7" />
                </div>
                <p className="mt-1 text-xs text-muted">{e.vi}</p>
              </div>
            ))}
          </div>

          {point.mistakes_vi.length > 0 && (
            <div className="mt-4 rounded-2xl bg-danger-soft px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-danger-text">
                <WarningCircle size={14} weight="duotone" />
                Lỗi hay gặp của người Việt
              </p>
              <ul className="mt-2 space-y-1 text-sm text-danger-text/90">
                {point.mistakes_vi.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-3 text-[11px] text-muted">Nguồn tham khảo: {point.source ?? "Minna no Nihongo / Genki"}</p>
        </div>
      )}
    </article>
  );
}
