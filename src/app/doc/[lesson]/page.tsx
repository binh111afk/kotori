import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Lightbulb } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { ExerciseRunner, type ExerciseData } from "@/components/study/exercise-runner";
import { FuriganaText } from "@/components/study/furigana";

type Params = { lesson: string };

interface VocabEntry { jp: string; r?: string; vi: string }
interface Paragraph { segments: { t: string; r?: string }[]; vi: string }
interface Passage { title: string; paragraphs: Paragraph[] }

export const instant = false;

async function LessonContent({ lesson }: Params & { lesson: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const [lessonRes, exercisesRes] = await Promise.all([
    supabase.from("reading_lessons").select("*").eq("id", lesson).single(),
    supabase.from("exercises").select("id,type,payload,explanation_vi,item_ref").eq("unit_id", lesson).order("order_index"),
  ]) as unknown as [{ data: Record<string, unknown> | null; error: unknown }, { data: ExerciseData[] | null; error: unknown }];

  if (!lessonRes.data) notFound();

  const lessonData = lessonRes.data as {
    title: string; topic: string; source: string; verified: boolean;
    vocabulary: VocabEntry[]; passages: Passage[];
  };
  const vocabulary = lessonData.vocabulary ?? [];
  const passages = lessonData.passages ?? [];
  const exercises = (exercisesRes.data ?? []) as ExerciseData[];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-bold">
          <Lightbulb size={18} weight="duotone" className="text-butter" />
          Từ mới trong bài
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {vocabulary.map((k: VocabEntry, i: number) => (
            <span key={i} className="rounded-full bg-surface-2 px-3.5 py-1.5 text-sm">
              <span className="font-jp font-semibold">{k.jp}</span>
              {k.r && <span className="ml-1 text-xs text-muted">({k.r})</span>}
              <span className="ml-1.5 text-xs text-muted">{k.vi}</span>
            </span>
          ))}
        </div>
      </section>

      {passages.map((p: Passage, i: number) => (
        <section key={i} className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="mb-3 font-bold">{p.title}</h2>
          <div className="space-y-4">
            {p.paragraphs.map((para: Paragraph, j: number) => (
              <div key={j}>
                <FuriganaText segments={para.segments} className="font-jp text-lg leading-loose" />
                <p className="mt-1 text-xs text-muted">{para.vi}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {exercises.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Kiểm tra hiểu bài</h2>
          <ExerciseRunner
            title={lessonData.title}
            exercises={exercises}
            kind="quiz"
            itemType={null}
            onExit={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </section>
      )}
    </div>
  );
}

export default async function ReadingLessonPage({ params }: PageProps<"/doc/[lesson]">) {
  const { lesson } = await params;

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <Link
          href="/doc"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} weight="duotone" />
          Đọc hiểu
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Bài đọc</h1>
      </div>
      <div className="mx-auto mt-4 w-full max-w-2xl px-4 sm:px-6">
        <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
          <LessonContent lesson={lesson} />
        </Suspense>
      </div>
    </div>
  );
}
