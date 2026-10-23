"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  CaretDown,
  CaretLeft,
  CaretRight,
  Cards,
  PencilSimpleLine,
  X,
} from "@phosphor-icons/react";
import { Flashcard } from "@/components/study/flashcard";
import { ExerciseRunner, type ExerciseData } from "@/components/study/exercise-runner";
import { GrammarLessons, type GrammarPointData } from "@/components/study/grammar-lessons";
import { SpeakButton } from "@/components/study/speak-button";
import { StrokeSvg } from "@/components/study/stroke-svg";
import { recordWrongAnswers } from "@/lib/study/record-wrong";
import { cn } from "@/lib/cn";

export interface KanaUnitItem {
  char: string;
  romaji: string;
}
export interface VocabUnitItem {
  id: string;
  kana: string;
  kanji: string | null;
  romaji: string;
  meaning_vi: string;
  example_jp: string | null;
  example_reading: string | null;
  example_vi: string | null;
}
export type UnitPayload =
  | { kind: "kana"; id: string; title: string; description: string; items: KanaUnitItem[] }
  | { kind: "vocab"; id: string; title: string; description: string; items: VocabUnitItem[] };

// ponytail: Math.random chỉ xáo thứ tự câu hỏi — không dùng cho mục đích bảo mật
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Sinh câu hỏi trắc nghiệm kana (char↔romaji) dưới dạng exercise thống nhất. */
function buildKanaExercises(items: KanaUnitItem[], pool: KanaUnitItem[]): ExerciseData[] {
  const out: ExerciseData[] = [];
  for (const it of sample(items, Math.min(12, items.length))) {
    const romajiOthers = sample(pool.filter((p) => p.romaji !== it.romaji), 3);
    const charOthers = sample(pool.filter((p) => p.char !== it.char), 3);
    if (romajiOthers.length < 3 || charOthers.length < 3) continue;
    if (Math.random() < 0.5) {
      const options = shuffle([it.romaji, ...romajiOthers.map((o) => o.romaji)]);
      out.push({
        id: `gen-kana-${it.char}`,
        type: "choice",
        payload: {
          question: it.char,
          speak: it.char,
          options,
          answerIndex: options.indexOf(it.romaji),
        },
        explanation_vi: `${it.char} đọc là "${it.romaji}".`,
      });
    } else {
      const options = shuffle([it.char, ...charOthers.map((o) => o.char)]);
      out.push({
        id: `gen-kana-${it.romaji}-${it.char}`,
        type: "choice",
        payload: {
          question: it.romaji,
          options,
          answerIndex: options.indexOf(it.char),
        },
        explanation_vi: `"${it.romaji}" viết là ${it.char}.`,
      });
    }
  }
  return out;
}

/** Sinh câu hỏi trắc nghiệm từ vựng (kana↔nghĩa). */
function buildVocabExercises(items: VocabUnitItem[]): ExerciseData[] {
  const out: ExerciseData[] = [];
  for (const w of sample(items, Math.min(10, items.length))) {
    const others = sample(items.filter((o) => o.id !== w.id), 3);
    if (others.length < 3) continue;
    if (Math.random() < 0.5) {
      const options = shuffle([w.meaning_vi, ...others.map((o) => o.meaning_vi)]);
      out.push({
        id: `gen-vocab-${w.id}-mean`,
        type: "choice",
        payload: { question: w.kana, speak: w.kana, options, answerIndex: options.indexOf(w.meaning_vi) },
        explanation_vi: `${w.kana} (${w.romaji}) nghĩa là "${w.meaning_vi}".`,
        item_ref: w.id,
      });
    } else {
      const options = shuffle([w.kana, ...others.map((o) => o.kana)]);
      out.push({
        id: `gen-vocab-${w.id}-word`,
        type: "choice",
        payload: { question: w.meaning_vi, options, answerIndex: options.indexOf(w.kana) },
        explanation_vi: `"${w.meaning_vi}" là ${w.kana} (${w.romaji}).`,
        item_ref: w.id,
      });
    }
  }
  return out;
}

export function UnitStudy({
  unit,
  allKana,
  grammarPoints,
  grammarExercises,
  userId,
}: {
  unit: UnitPayload;
  allKana: KanaUnitItem[];
  grammarPoints: GrammarPointData[];
  grammarExercises: ExerciseData[];
  userId: string;
}) {
  const hasGrammar = unit.kind === "vocab" && grammarPoints.length > 0;
  const [tab, setTab] = useState<"hoc" | "nguphap" | "luyen">("hoc");

  const exercises = useMemo<ExerciseData[]>(() => {
    const gen =
      unit.kind === "kana"
        ? buildKanaExercises(unit.items.length ? unit.items : sample(allKana, 12), allKana)
        : buildVocabExercises(unit.items);
    return shuffle([...grammarExercises, ...gen]);
  }, [unit, allKana, grammarExercises]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <div className="mt-2 mb-6 inline-flex flex-wrap rounded-full bg-surface-2 p-1">
        {(
          [
            { key: "hoc" as const, label: "Học", icon: BookOpen },
            ...(hasGrammar ? [{ key: "nguphap" as const, label: "Ngữ pháp", icon: Cards }] : []),
            { key: "luyen" as const, label: "Luyện", icon: PencilSimpleLine },
          ] as { key: "hoc" | "nguphap" | "luyen"; label: string; icon: typeof BookOpen }[]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground shadow-soft" : "text-muted hover:text-foreground",
            )}
          >
            <t.icon size={16} weight="duotone" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hoc" ? (
        unit.kind === "kana" ? (
          <KanaLearn items={unit.items} />
        ) : (
          <VocabLearn items={unit.items} />
        )
      ) : tab === "nguphap" ? (
        <GrammarLessons points={grammarPoints} />
      ) : exercises.length ? (
        <ExerciseRunner
          title={unit.title}
          exercises={exercises}
          kind="quiz"
          itemType={unit.kind === "kana" ? "kana" : null}
          onExit={() => setTab("hoc")}
          onFinish={(wrong) => void recordWrongAnswers(userId, wrong)}
        />
      ) : (
        <p className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-muted">
          Chưa có dữ liệu cho bài luyện — nội dung sẽ được cập nhật ở Phase 7.
        </p>
      )}
    </div>
  );
}

function KanaLearn({ items }: { items: KanaUnitItem[] }) {
  const [open, setOpen] = useState<KanaUnitItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((it) => (
          <button
            key={it.char}
            type="button"
            onClick={() => setOpen(it)}
            className="group rounded-3xl border border-border bg-surface p-4 text-center shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-lift"
          >
            <p className="font-jp text-4xl font-bold">{it.char}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{it.romaji}</p>
            <SpeakButton text={it.char} size={16} className="mt-1 [&>button]:size-7" />
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Bấm vào một chữ để xem thứ tự nét viết.
      </p>

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
              className="w-full max-w-xs rounded-3xl bg-surface p-6 text-center shadow-lift"
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={`Chi tiết chữ ${open.char}`}
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
              <StrokeSvg char={open.char} size={150} className="mt-2" />
              <p className="mt-2 font-jp text-2xl font-bold">{open.char}</p>
              <p className="text-sm font-semibold text-muted">{open.romaji}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VocabLearn({ items }: { items: VocabUnitItem[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const w = items[index];

  if (!w) {
    return (
      <p className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-muted">
        Unit này chưa có từ vựng.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Flashcard
        front={
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-border bg-surface p-6 text-center shadow-soft">
            <p className="font-jp text-5xl font-bold">{w.kana}</p>
            {w.kanji && <p className="mt-1 font-jp text-lg text-muted">{w.kanji}</p>}
            <div className="mt-3 flex items-center gap-2">
              <SpeakButton text={w.kana} slow />
            </div>
            <p className="mt-4 text-xs text-muted">Bấm để xem nghĩa</p>
          </div>
        }
        back={
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-border bg-primary-soft p-5 text-center">
            <p className="text-sm font-semibold text-primary-text">{w.romaji}</p>
            <p className="mt-0.5 text-lg font-bold">{w.meaning_vi}</p>
            {w.example_jp && (
              <div className="mt-2 text-xs">
                <p className="font-jp">{w.example_jp}</p>
                {w.example_vi && <p className="mt-0.5 text-muted">{w.example_vi}</p>}
              </div>
            )}
          </div>
        }
      />

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Thẻ trước"
          className="grid size-11 place-items-center rounded-full border border-border bg-surface shadow-soft transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <CaretLeft size={18} weight="duotone" />
        </button>
        <motion.p
          key={index}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted"
        >
          {index + 1} / {items.length}
        </motion.p>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          disabled={index === items.length - 1}
          aria-label="Thẻ sau"
          className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <CaretRight size={18} weight="duotone" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Từ ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-surface-2 hover:bg-muted/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
