import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ChartBar, Headphones, BookOpen, Medal } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import kanaData from "@/content/kana.json";
import vocabData from "@/content/vocab-n5.json";
import { loadStats } from "@/lib/study/stats-loader";
import { levelProgress } from "@/lib/study/level";
import { evaluateBadges } from "@/lib/study/badges";
import { FadeIn } from "@/components/motion/fade-in";
import { GoalRing, StreakFlame } from "@/components/study/progress-widgets";

export const metadata: Metadata = { title: "Học" };

const kanaTints = ["bg-primary-soft", "bg-secondary-soft", "bg-mint-soft", "bg-butter-soft"];

async function Overview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const loaded = await loadStats();
  if (!loaded) return null;

  const { stats, profile } = loaded;
  const lp = levelProgress(stats.xp);
  const earnedBadges = evaluateBadges(stats).filter((b) => b.earned);
  const goalReached = loaded.todayXp >= profile.daily_goal_xp;

  return (
    <div className="space-y-3">
      <Link
        href="/on-tap"
        className="group flex items-center justify-between gap-4 rounded-3xl bg-primary p-6 text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
      >
        <div>
          <p className="text-sm opacity-80">Ôn tập hôm nay</p>
          <p className="text-3xl font-bold">
            {loaded.totalCards - loaded.masteredCards >= 0 ? "" : ""}
            <DueCount />
          </p>
          <p className="mt-1 text-xs opacity-80">
            {goalReached
              ? "Mục tiêu hôm nay đã đạt — học thêm vẫn tốt nhé!"
              : "Ôn trước lúc quên — vài phút thôi nhé!"}
          </p>
        </div>
        <Image
          src="/brand/kotori-mascot.svg"
          alt=""
          width={84}
          height={84}
          className="shrink-0 transition-transform group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <GoalRing todayXp={loaded.todayXp} goal={profile.daily_goal_xp} />
          <div>
            <p className="text-sm font-semibold">Mục tiêu hôm nay</p>
            <p className="text-xs text-muted">
              Cấp {lp.level} · {profile.daily_goal_xp} XP/ngày ·{" "}
              <Link href="/ho-so" className="underline decoration-dotted underline-offset-2">
                đổi mục tiêu
              </Link>
            </p>
            <div className="mt-1.5 h-1.5 w-36 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.round(lp.ratio * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted">
              {lp.nextLevelXp - stats.xp} XP nữa lên cấp {lp.level + 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <StreakFlame
            streak={stats.streak}
            activeToday={profile.last_study_date === loaded.week[6]?.date}
            freezes={profile.streak_freezes}
          />
          <Link
            href="/thong-ke"
            className="flex items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-foreground"
          >
            <ChartBar size={16} weight="duotone" />
            Thống kê
          </Link>
        </div>
      </div>

      {earnedBadges.length > 0 && (
        <Link
          href="/thong-ke"
          className="flex items-center gap-2 rounded-3xl border border-border bg-surface px-5 py-3.5 text-sm shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Medal size={18} weight="duotone" className="text-butter" />
          <span className="font-semibold">
            {earnedBadges.length} huy hiệu
          </span>
          <span className="text-muted">
            mới nhất: {earnedBadges[earnedBadges.length - 1].name}
          </span>
        </Link>
      )}
    </div>
  );
}

async function DueCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <>0 thẻ đến hạn</>;

  const now = new Date().toISOString();
  const { count } = await supabase
    .from("srs_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("due_at", now);

  return (
    <>
      {count ?? 0} thẻ đến hạn
    </>
  );
}

async function N4GrammarSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const { data: points } = await supabase
    .from("grammar_points")
    .select("unit_id")
    .eq("level", "n4")
    .order("order_index");

  const n4UnitIds = [...new Set((points ?? []).map((u: { unit_id: string }) => u.unit_id))];

  const n4Units: { id: string; title: string }[] = [
    { id: "n4-u1", title: "Khả năng & khả năng hoá" },
    { id: "n4-u2", title: "Điều kiện たら・ば・なら" },
    { id: "n4-u3", title: "て-form nâng cao" },
    { id: "n4-u4", title: "Bị động 受身" },
    { id: "n4-u5", title: "Khiến động 使役" },
    { id: "n4-u6", title: "Truyền đạt & suy đoán" },
    { id: "n4-u7", title: "Song song & liệt kê" },
    { id: "n4-u8", title: "Tổng hợp & bổ trợ" },
  ].filter((u) => n4UnitIds.includes(u.id));

  const tints = ["bg-primary-soft", "bg-secondary-soft", "bg-mint-soft", "bg-butter-soft"];

  return (
    <>
      <FadeIn className="mt-10">
        <h1 className="text-xl font-bold tracking-tight">JLPT N4 — Ngữ pháp</h1>
        <p className="mt-1 text-sm text-muted">
          19 điểm ngữ pháp N4 mới: khả động, bị động, khiếN động, điều kiện, truyền đạt…
        </p>
      </FadeIn>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {n4Units.map((u, i) => (
          <Link
            key={u.id}
            href={`/hoc/${u.id}`}
            className={`rounded-3xl border border-border p-5 shadow-soft transition-transform hover:-translate-y-0.5 ${tints[i % tints.length]}`}
          >
            <p className="font-bold">{u.title}</p>
            <p className="mt-0.5 text-sm text-muted">
              {(points ?? []).filter((g: { unit_id: string }) => g.unit_id === u.id).length} điểm ngữ pháp
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function StudyDashboardPage() {
  const kanaUnits = Object.entries(kanaData.units)
    .map(([id, u]) => ({ id, ...u, count: kanaData.items.filter((i) => i.unit_id === id).length }))
    .sort((a, b) => a.order - b.order);
  const vocabUnits = [...vocabData.units]
    .map((u) => ({ ...u, count: vocabData.words.filter((w) => w.unit_id === u.id).length }))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Suspense fallback={<div aria-hidden className="h-64 animate-pulse rounded-3xl bg-surface-2" />}>
        <Overview />
      </Suspense>

      <FadeIn className="mt-10">
        <h1 className="text-xl font-bold tracking-tight">Kana — bảng chữ cái</h1>
        <p className="mt-1 text-sm text-muted">
          Nền móng của tiếng Nhật. Học xong hàng nào bấm vào chữ để xem thứ tự nét.
        </p>
      </FadeIn>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {kanaUnits.map((u, i) => (
          <Link
            key={u.id}
            href={`/hoc/${u.id}`}
            className={`rounded-3xl border border-border p-5 shadow-soft transition-transform hover:-translate-y-0.5 ${kanaTints[i % kanaTints.length]}`}
          >
            <p className="font-bold">{u.title}</p>
            <p className="mt-0.5 text-sm text-muted">{u.count} chữ</p>
          </Link>
        ))}
      </div>

      <FadeIn className="mt-10">
        <h1 className="text-xl font-bold tracking-tight">Từ vựng &amp; ngữ pháp JLPT N5</h1>
        <p className="mt-1 text-sm text-muted">
          Học theo chủ đề — flashcard có phát âm, ngữ pháp có ví dụ furigana.
        </p>
      </FadeIn>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {vocabUnits.map((u, i) => (
          <Link
            key={u.id}
            href={`/hoc/${u.id}`}
            className={`rounded-3xl border border-border p-5 shadow-soft transition-transform hover:-translate-y-0.5 ${kanaTints[(i + 1) % kanaTints.length]}`}
          >
            <p className="font-bold">{u.title}</p>
            <p className="mt-0.5 text-sm text-muted">{u.count} từ · {u.description}</p>
          </Link>
        ))}
      </div>

      <FadeIn className="mt-6">
        <Link
          href="/kanji"
          className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-butter-soft font-jp text-xl font-bold text-butter">
            字
          </span>
          <div>
            <p className="font-bold">Kanji N5 — 100 chữ</p>
            <p className="text-sm text-muted">
              Hoạt hình nét viết, âm on/kun, từ ghép — luyện quiz đẩy SRS.
            </p>
          </div>
        </Link>
      </FadeIn>

      <Suspense fallback={<div aria-hidden className="mt-10 h-40 animate-pulse rounded-3xl bg-surface-2" />}>
        <N4GrammarSection />
      </Suspense>

      <FadeIn className="mt-3 grid gap-3 sm:grid-cols-2">
        <Link
          href="/nghe"
          className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary-soft text-secondary-text">
            <Headphones size={22} weight="duotone" />
          </span>
          <div>
            <p className="font-bold">Luyện nghe</p>
            <p className="text-sm text-muted">
              Hội thoại ngắn theo đúng bài đã học — mẹo nghe, chậm/thường, transcript.
            </p>
          </div>
        </Link>
        <Link
          href="/doc"
          className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-text">
            <BookOpen size={22} weight="duotone" />
          </span>
          <div>
            <p className="font-bold">Đọc hiểu</p>
            <p className="text-sm text-muted">
              Đoạn văn ngắn furigana từng chữ — từ mới chú thích, kiểm tra hiểu bài.
            </p>
          </div>
        </Link>
      </FadeIn>

      <p className="mt-10 text-center text-sm text-muted">
        Nội dung N5 đang được biên soạn và kiểm chứng từng unit — mỗi chặng sẽ có thêm
        bài mới, game và bài nghe.
      </p>
    </div>
  );
}
