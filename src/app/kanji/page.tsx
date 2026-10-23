import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { KanjiLibrary, type KanjiItem } from "@/components/study/kanji-library";

export const metadata: Metadata = { title: "Kanji N5" };

async function KanjiContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const { data: rows } = await supabase
    .from("kanji")
    .select("id,char,meaning_vi,on_reading,kun_reading,stroke_count,examples")
    .order("order_index");
  const items = ((rows ?? []) as KanjiItem[]).map((k) => ({
    ...k,
    examples: (k.examples ?? []) as KanjiItem["examples"],
  }));

  return <KanjiLibrary items={items} userId={user.id} />;
}

export default function KanjiPage() {
  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Link
          href="/hoc"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} weight="duotone" />
          Trang học
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Kanji N5 — 100 chữ</h1>
        <p className="mt-1 text-sm text-muted">
          Sắp theo số nét. Mỗi chữ có hoạt hình thứ tự nét, âm on/kun và từ ghép có sẵn
          trong lộ trình.
        </p>
      </div>
      <div className="mx-auto mt-4 w-full max-w-3xl px-4 sm:px-6">
        <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
          <KanjiContent />
        </Suspense>
      </div>
    </div>
  );
}
