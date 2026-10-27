import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/components/motion/fade-in";
import {
  Cards,
  HandTap,
  Lightning,
  PuzzlePiece,
  Balloon,
  Ear,
  PencilSimpleLine,
  Brain,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Chơi" };

const games = [
  {
    slug: "noi-tu",
    name: "Nối từ",
    desc: "Nối tiếng Nhật với nghĩa tiếng Việt — sai bớt điểm, nhanh tay nhiều điểm.",
    icon: PuzzlePiece,
    tint: "bg-primary-soft text-primary-text",
  },
  {
    slug: "lat-the",
    name: "Lật thẻ ghi nhớ",
    desc: "16 thẻ úp — tìm đủ 8 cặp. Ít lần lật sai hơn, nhiều XP hơn.",
    icon: Cards,
    tint: "bg-secondary-soft text-secondary-text",
  },
  {
    slug: "go-nhanh",
    name: "Gõ nhanh",
    desc: "Từ rơi từ trên xuống — gõ romaji trước khi chạm đáy. 3 mạng, combo nhân điểm.",
    icon: HandTap,
    tint: "bg-mint-soft text-mint",
  },
  {
    slug: "quiz-toc-do",
    name: "Quiz tốc độ",
    desc: "6 giây mỗi câu, combo nhân điểm tới ×5. Kịp suy nghĩ là thua đâu.",
    icon: Lightning,
    tint: "bg-butter-soft text-butter",
  },
  {
    slug: "bong-bong",
    name: "Bong bóng",
    desc: "Bong bóng bay lên — bấm đúng bong bóng chứa nghĩa tiếng Việt.",
    icon: Balloon,
    tint: "bg-primary-soft text-primary-text",
  },
  {
    slug: "nghe-chon",
    name: "Nghe & Chọn",
    desc: "Nghe phát âm rồi chọn đúng chữ kana — luyện tai và phản xạ.",
    icon: Ear,
    tint: "bg-secondary-soft text-secondary-text",
  },
  {
    slug: "xep-cau",
    name: "Xếp câu",
    desc: "Sắp xếp các từ thành câu đúng — luyện ngữ pháp qua trò chơi.",
    icon: PencilSimpleLine,
    tint: "bg-mint-soft text-mint",
  },
  {
    slug: "tri-nho",
    name: "Trí nhớ chuỗi",
    desc: "Chữ kana hiện lên từng cái — nhớ thứ tự rồi bấm lại. Mỗi vòng dài hơn!",
    icon: Brain,
    tint: "bg-butter-soft text-butter",
  },
];

export default function GameLobbyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight">Sảnh game</h1>
        <p className="mt-1 text-sm text-muted">
          Chơi mà học — mọi từ sai trong game sẽ tự động vào hàng ôn tập SRS của bạn,
          và điểm số vẫn cộng XP qua hệ thống phía server.
        </p>
      </FadeIn>

      <Suspense fallback={<div aria-hidden className="mt-6 h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <GameCards />
      </Suspense>
    </div>
  );
}

async function GameCards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {games.map((g, i) => (
          <Link
            key={g.slug}
            href={`/choi/${g.slug}`}
            className={`rounded-3xl border border-border bg-surface p-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-lift ${i >= 4 ? "sm:opacity-90" : ""}`}
        >
          <span className={`mb-3 inline-grid size-11 place-items-center rounded-2xl ${g.tint}`}>
            <g.icon size={22} weight="duotone" />
          </span>
          <p className="font-bold">{g.name}</p>
          <p className="mt-0.5 text-sm text-muted">{g.desc}</p>
        </Link>
      ))}
    </div>
  );
}
