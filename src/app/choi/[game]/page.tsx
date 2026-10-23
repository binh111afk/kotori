import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import kanaData from "@/content/kana.json";
import { MatchGame } from "@/components/games/match-game";
import { MemoryGame } from "@/components/games/memory-game";
import { TypingGame } from "@/components/games/typing-game";
import { SpeedQuizGame } from "@/components/games/speed-quiz";

type Params = { game: string };

const GAME_TITLES: Record<string, string> = {
  "noi-tu": "Nối từ",
  "lat-the": "Lật thẻ ghi nhớ",
  "go-nhanh": "Gõ nhanh",
  "quiz-toc-do": "Quiz tốc độ",
};

export function generateStaticParams() {
  return Object.keys(GAME_TITLES).map((game) => ({ game }));
}

export async function generateMetadata({ params }: PageProps<"/choi/[game]">): Promise<Metadata> {
  const { game } = await params;
  return { title: GAME_TITLES[game] ?? "Game" };
}

interface Item {
  jp: string;
  vi: string;
  romaji: string;
  id: string;
  itemType: "kana" | "vocab";
  speak: string;
}

async function GameContent({ game }: Params & { game: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const { data: vocabRows } = await supabase
    .from("vocab")
    .select("id,kana,romaji,meaning_vi")
    .order("order_index");

  const kanaItems: Item[] = kanaData.items.map((k) => ({
    jp: k.char,
    vi: k.romaji,
    romaji: k.romaji,
    id: k.char,
    itemType: "kana",
    speak: k.char,
  }));
  const vocabItems: Item[] = (vocabRows ?? []).map((w) => ({
    jp: w.kana,
    vi: w.meaning_vi,
    romaji: w.romaji,
    id: w.id,
    itemType: "vocab",
    speak: w.kana,
  }));
  const all = [...kanaItems, ...vocabItems];

  switch (game) {
    case "noi-tu":
      return <MatchGame title={GAME_TITLES[game]} items={all} userId={user.id} />;
    case "lat-the":
      return <MemoryGame title={GAME_TITLES[game]} items={all} userId={user.id} />;
    case "go-nhanh":
      return (
        <TypingGame
          title={GAME_TITLES[game]}
          items={all.map((it) => ({ jp: it.jp, romaji: it.romaji, id: it.id, itemType: it.itemType }))}
          userId={user.id}
        />
      );
    case "quiz-toc-do":
      return (
        <SpeedQuizGame
          title={GAME_TITLES[game]}
          source={{
            kana: kanaItems.map((k) => ({ char: k.jp, romaji: k.romaji })),
            vocab: vocabItems.map((v) => ({ id: v.id, kana: v.jp, meaning_vi: v.vi })),
          }}
          userId={user.id}
        />
      );
    default:
      notFound();
  }
}

export default async function GamePage({ params }: PageProps<"/choi/[game]">) {
  const { game } = await params;
  const title = GAME_TITLES[game];
  if (!title) notFound();

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-lg px-4">
        <Link
          href="/choi"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} weight="duotone" />
          Sảnh game
        </Link>
      </div>
      <Suspense fallback={<div aria-hidden className="mx-auto mt-6 h-80 w-full max-w-lg animate-pulse rounded-3xl bg-surface-2" />}>
        <GameContent game={game} />
      </Suspense>
    </div>
  );
}
