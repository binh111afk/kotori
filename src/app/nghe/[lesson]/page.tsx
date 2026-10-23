import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Lightbulb, MapPin } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import type { ExerciseData } from "@/components/study/exercise-runner";
import { ListeningExercises } from "@/components/study/listening-exercises";
import { ListeningPlayer, type DialogueLine } from "@/components/study/listening-player";
import { FuriganaText } from "@/components/study/furigana";

type Params = { lesson: string };

interface Theory {
  tips: string[];
  keywords: { jp: string; r?: string; vi: string }[];
}

// Bài nghe nằm trong DB — route chặn động theo request (không prerender).
export const instant = false;

async function LessonContent({ lesson }: Params & { lesson: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const [lessonRes, exercisesRes] = await Promise.all([
    supabase.from("listening_lessons").select("*").eq("id", lesson).single(),
    supabase.from("exercises").select("id,type,payload,explanation_vi,item_ref").eq("unit_id", lesson).order("order_index"),
  ]);
  if (!lessonRes.data) notFound();

  const lessonData = lessonRes.data;
  const theory = lessonData.theory as unknown as Theory;
  const dialogue = lessonData.dialogue as unknown as { lines: DialogueLine[] };
  const exercises = (exercisesRes.data ?? []) as ExerciseData[];
  return (
    <div className="space-y-6">
      {/* 1. Lý thuyết: mẹo nghe + từ khoá */}
      <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-bold">
          <Lightbulb size={18} weight="duotone" className="text-butter" />
          Mẹo nghe
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {theory.tips.map((tip, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold text-primary-text">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
          <MapPin size={14} weight="duotone" /> Từ khoá cần tai quen
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {theory.keywords.map((k, i) => (
            <span key={i} className="rounded-full bg-surface-2 px-3.5 py-1.5 text-sm">
              <span className="font-jp font-semibold">{k.jp}</span>
              {k.r && <span className="ml-1 text-xs text-muted">({k.r})</span>}
              <span className="ml-1.5 text-xs text-muted">{k.vi}</span>
            </span>
          ))}
        </div>
      </section>

      {/* 2. Nghe hội thoại */}
      <section>
        <h2 className="mb-3 font-bold">Nghe hội thoại</h2>
        <ListeningPlayer lines={dialogue.lines} title={lessonData.title} />
      </section>

      {/* 3. Bài tập ứng dụng */}
      {exercises.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Bài tập ứng dụng</h2>
          <ListeningExercises title={lessonData.title} exercises={exercises} />
        </section>
      )}

      {/* 4. Transcript đầy đủ (đáp án + dịch) */}
      <section id="transcript" className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-bold">Transcript &amp; bản dịch</h2>
        <div className="mt-3 space-y-3">
          {dialogue.lines.map((line, i) => (
            <div key={i} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <p className="text-xs font-bold text-primary-text">{line.speaker}</p>
              <FuriganaText segments={line.segments} className="font-jp text-lg leading-loose" />
              <p className="mt-0.5 text-xs text-muted">{line.vi}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Nguồn hội thoại: {lessonData.source} · {lessonData.verified ? "đã kiểm chứng" : "chưa kiểm chứng"}
        </p>
      </section>
    </div>
  );
}

export default async function ListeningLessonPage({ params }: PageProps<"/nghe/[lesson]">) {
  const { lesson } = await params;

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <Link
          href="/nghe"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} weight="duotone" />
          Luyện nghe
        </Link>
        <h1 className="mt-2 font-jp text-2xl font-bold tracking-tight">Bài nghe</h1>
      </div>
      <div className="mx-auto mt-4 w-full max-w-2xl px-4 sm:px-6">
        <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
          <LessonContent lesson={lesson} />
        </Suspense>
      </div>
    </div>
  );
}
