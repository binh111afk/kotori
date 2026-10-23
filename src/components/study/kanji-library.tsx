"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PencilSimpleLine, X } from "@phosphor-icons/react";
import { StrokeSvg } from "@/components/study/stroke-svg";
import { SpeakButton } from "@/components/study/speak-button";
import { ExerciseRunner, type ExerciseData } from "@/components/study/exercise-runner";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { sample, shuffle } from "@/lib/games/random";
import { cn } from "@/lib/cn";

export interface KanjiItem {
  id: string;
  char: string;
  meaning_vi: string;
  on_reading: string[];
  kun_reading: string[];
  stroke_count: number;
  examples: { word: string; reading: string; vi: string }[];
}

export function KanjiLibrary({ items, userId }: { items: KanjiItem[]; userId: string }) {
  const [mode, setMode] = useState<"hoc" | "luyen">("hoc");
  const [open, setOpen] = useState<KanjiItem | null>(null);

  const exercises = useMemo<ExerciseData[]>(() => {
    const out: ExerciseData[] = [];
    for (const k of sample(items, 12)) {
      const meaningOthers = sample(items.filter((o) => o.id !== k.id), 3);
      if (meaningOthers.length < 3) continue;
      if (Math.random() < 0.5) {
        const options = shuffle([k.meaning_vi, ...meaningOthers.map((o) => o.meaning_vi)]);
        out.push({
          id: `gen-kanji-${k.id}-mean`,
          type: "choice",
          payload: { question: k.char, speak: k.char, options, answerIndex: options.indexOf(k.meaning_vi) },
          explanation_vi: `${k.char} = ${k.meaning_vi}. Âm on: ${k.on_reading.join("・") || "—"}, kun: ${k.kun_reading.join("・") || "—"}.`,
          item_ref: k.id,
        });
      } else {
        const charOthers = sample(items.filter((o) => o.char !== k.char), 3);
        const options = shuffle([k.char, ...charOthers.map((o) => o.char)]);
        out.push({
          id: `gen-kanji-${k.id}-char`,
          type: "choice",
          payload: { question: k.meaning_vi, options, answerIndex: options.indexOf(k.char) },
          explanation_vi: `"${k.meaning_vi}" là kanji ${k.char} (${k.on_reading.join("・") || k.kun_reading.join("・")}).`,
          item_ref: k.id,
        });
      }
    }
    return out;
  }, [items]);

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full bg-surface-2 p-1">
        {(
          [
            { key: "hoc" as const, label: "Thư viện" },
            { key: "luyen" as const, label: "Luyện 10 câu", icon: PencilSimpleLine },
          ]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setMode(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              mode === t.key ? "bg-primary text-primary-foreground shadow-soft" : "text-muted hover:text-foreground",
            )}
          >
            {t.icon && <t.icon size={16} weight="duotone" />}
            {t.label}
          </button>
        ))}
      </div>

      {mode === "luyen" ? (
        <ExerciseRunner
          title="Kanji N5"
          exercises={exercises}
          kind="quiz"
          itemType="kanji"
          onExit={() => setMode("hoc")}
          onFinish={(wrong) => void recordWrongAnswers(userId, wrong)}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
            {items.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setOpen(k)}
                className="rounded-3xl border border-border bg-surface p-3 text-center shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-lift"
              >
                <p className="font-jp text-4xl font-bold">{k.char}</p>
                <p className="mt-1 line-clamp-1 text-xs font-semibold text-muted">{k.meaning_vi}</p>
                <p className="text-[10px] text-muted/70">{k.stroke_count} nét</p>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Bấm vào một chữ để xem thứ tự nét, âm on/kun và từ ghép. Sắp xếp theo số nét tăng dần.
          </p>
        </>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-surface p-6 shadow-lift"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={`Chi tiết kanji ${open.char}`}
            >
              <div className="flex items-start justify-between">
                <SpeakButton text={open.char} />
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Đóng"
                  className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2"
                >
                  <X size={18} weight="duotone" />
                </button>
              </div>
              <StrokeSvg char={open.char} size={140} className="mt-1" />
              <p className="mt-2 text-center font-jp text-3xl font-bold">{open.char}</p>
              <p className="text-center text-sm font-semibold">{open.meaning_vi}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {open.on_reading.map((r) => (
                  <span key={r} className="rounded-full bg-secondary-soft px-3 py-1 font-jp text-xs font-semibold text-secondary-text">
                    {r}
                  </span>
                ))}
                {open.kun_reading.map((r) => (
                  <span key={r} className="rounded-full bg-mint-soft px-3 py-1 font-jp text-xs font-semibold text-mint">
                    {r}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-center text-[10px] text-muted">
                on (katakana) · kun (hiragana) · {open.stroke_count} nét
              </p>

              <div className="mt-4 space-y-2">
                {open.examples.map((e, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-2xl bg-surface-2 px-3.5 py-2.5">
                    <div>
                      <p className="font-jp text-sm font-bold">
                        {e.word} <span className="text-xs font-medium text-muted">({e.reading})</span>
                      </p>
                      <p className="text-xs text-muted">{e.vi}</p>
                    </div>
                    <SpeakButton text={e.reading || e.word} size={14} className="[&>button]:size-7" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
