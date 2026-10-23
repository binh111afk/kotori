import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Headphones } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/components/motion/fade-in";

export const metadata: Metadata = { title: "Luyện nghe" };

async function LessonList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const { data: lessons } = await supabase
    .from("listening_lessons")
    .select("id,title,topic,verified")
    .order("order_index");

  return (
    <div className="mt-6 space-y-3">
      {(lessons ?? []).map((l, i) => (
        <Link
          key={l.id}
          href={`/nghe/${l.id}`}
          className={`flex items-center gap-4 rounded-3xl border border-border p-5 shadow-soft transition-transform hover:-translate-y-0.5 ${
            ["bg-primary-soft", "bg-secondary-soft", "bg-mint-soft"][i % 3]
          }`}
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface text-primary-text">
            <Headphones size={22} weight="duotone" />
          </span>
          <div>
            <p className="font-jp font-bold">{l.title}</p>
            <p className="text-sm text-muted">{l.topic}</p>
          </div>
        </Link>
      ))}
      {(lessons ?? []).length === 0 && (
        <p className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-muted">
          Bài nghe đang được biên soạn — quay lại sau nhé.
        </p>
      )}
    </div>
  );
}

export default function ListeningLobbyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <FadeIn>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Headphones size={24} weight="duotone" className="text-primary-text" />
          Luyện nghe
        </h1>
        <p className="mt-1 text-sm text-muted">
          Mỗi bài: mẹo nghe → nghe hội thoại (chậm/thường) → bài tập → transcript +
          bản dịch. Nghe 2–3 lần trước khi bật transcript nhé.
        </p>
      </FadeIn>
      <Suspense fallback={<div aria-hidden className="mt-6 h-64 animate-pulse rounded-3xl bg-surface-2" />}>
        <LessonList />
      </Suspense>
    </div>
  );
}
