import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import kanaData from "@/content/kana.json";
import vocabData from "@/content/vocab-n5.json";
import {
  UnitStudy,
  type UnitPayload,
  type KanaUnitItem,
  type VocabUnitItem,
} from "@/components/study/unit-study";
import type { ExerciseData } from "@/components/study/exercise-runner";
import type { GrammarPointData } from "@/components/study/grammar-lessons";

type Params = { unitId: string };

const kanaUnits = kanaData.units as Record<string, { title: string; order: number }>;

export function generateStaticParams() {
  return [...Object.keys(kanaData.units), ...vocabData.units.map((u) => u.id)].map((unitId) => ({
    unitId,
  }));
}

export async function generateMetadata({ params }: PageProps<"/hoc/[unitId]">): Promise<Metadata> {
  const { unitId } = await params;
  const kanaUnit = kanaUnits[unitId];
  const vocabUnit = vocabData.units.find((u) => u.id === unitId);
  const grammarUnit = vocabData.units.find((u) => u.id === unitId);
  return { title: kanaUnit?.title ?? grammarUnit?.title ?? vocabUnit?.title ?? "Bài học" };
}

async function UnitContent({ unitId }: Params & { unitId: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  let unit: UnitPayload | null = null;
  let grammarPoints: GrammarPointData[] = [];
  let grammarExercises: ExerciseData[] = [];

  if (unitId in kanaUnits) {
    const meta = kanaUnits[unitId];
    unit = {
      kind: "kana",
      id: unitId,
      title: meta.title,
      description: meta.title,
      items: kanaData.items
        .filter((i) => i.unit_id === unitId)
        .map((i) => ({ char: i.char, romaji: i.romaji })),
    };
  } else if (vocabData.units.some((u) => u.id === unitId)) {
    const meta = vocabData.units.find((u) => u.id === unitId)!;
    const [wordsRes, grammarRes, exercisesRes] = await Promise.all([
      supabase
        .from("vocab")
        .select("id,kana,kanji,romaji,meaning_vi,example_jp,example_reading,example_vi")
        .eq("unit_id", unitId)
        .order("order_index"),
      supabase
        .from("grammar_points")
        .select("id,title,structure,explanation_vi,mistakes_vi,examples,source")
        .eq("unit_id", unitId)
        .order("order_index"),
      supabase
        .from("exercises")
        .select("id,type,payload,explanation_vi,item_ref")
        .eq("unit_id", unitId)
        .order("order_index"),
    ]);

    unit = {
      kind: "vocab",
      id: unitId,
      title: meta.title,
      description: meta.description,
      items: (wordsRes.data ?? []) as VocabUnitItem[],
    };
    grammarPoints = (grammarRes.data ?? []) as GrammarPointData[];
    grammarExercises = (exercisesRes.data ?? []) as ExerciseData[];
  }

  if (!unit) notFound();

  return (
    <UnitStudy
      unit={unit}
      allKana={kanaData.items.map((i) => ({ char: i.char, romaji: i.romaji }))}
      grammarPoints={grammarPoints}
      grammarExercises={grammarExercises}
      userId={user.id}
    />
  );
}

export default async function UnitPage({ params }: PageProps<"/hoc/[unitId]">) {
  const { unitId } = await params;
  const kanaUnit = kanaUnits[unitId];
  const vocabUnit = vocabData.units.find((u) => u.id === unitId);
  const title = kanaUnit?.title ?? vocabUnit?.title ?? "Bài học";
  const back = unitId.startsWith("k") ? "Bảng kana" : "Từ vựng N5";

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Link
          href="/hoc"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} weight="duotone" />
          {back}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        {vocabUnit?.description && <p className="mt-1 text-sm text-muted">{vocabUnit.description}</p>}
      </div>
      <Suspense fallback={<div aria-hidden className="mx-auto mt-6 h-72 w-full max-w-3xl animate-pulse rounded-3xl bg-surface-2" />}>
        <UnitContent unitId={unitId} />
      </Suspense>
    </div>
  );
}

export type { KanaUnitItem };
