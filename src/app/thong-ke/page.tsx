import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadStats } from "@/lib/study/stats-loader";
import { levelProgress } from "@/lib/study/level";
import { evaluateBadges } from "@/lib/study/badges";
import { GoalRing, StreakFlame } from "@/components/study/progress-widgets";
import { FadeIn } from "@/components/motion/fade-in";
import {
  Books,
  Brain,
  Medal,
  Sparkle,
  Target,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Thống kê" };

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">{children}</div>
  );
}

async function StatsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const loaded = await loadStats();
  if (!loaded) return null;
  const { stats, profile, week } = loaded;
  const lp = levelProgress(stats.xp);
  const allBadges = evaluateBadges(stats);
  const accuracy =
    stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : null;
  const maxXp = Math.max(...week.map((w) => w.xp), 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <GoalRing todayXp={loaded.todayXp} goal={profile.daily_goal_xp} size={92} />
          <div>
            <p className="font-bold">
              Cấp {lp.level} · {stats.xp} XP
            </p>
            <div className="mt-1.5 h-2 w-44 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(lp.ratio * 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {lp.nextLevelXp - stats.xp} XP nữa lên cấp {lp.level + 1}
            </p>
          </div>
        </div>
        <StreakFlame
          streak={stats.streak}
          activeToday={profile.last_study_date === week[6]?.date}
          freezes={profile.streak_freezes}
          size="lg"
        />
      </div>

      <FadeIn>
        <h2 className="mb-3 font-bold">XP 7 ngày qua</h2>
        <Card>
          <div className="flex h-36 items-end justify-between gap-2">
            {week.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <p className="text-[11px] font-semibold text-muted">{d.xp > 0 ? d.xp : ""}</p>
                <div className="flex h-24 w-full items-end">
                  <div
                    className="w-full rounded-t-xl bg-primary/85 transition-all"
                    style={{ height: `${Math.max(4, (d.xp / maxXp) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] font-medium text-muted">{d.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Target size={16} weight="duotone" /> Độ chính xác
          </p>
          <p className="mt-1 text-3xl font-bold">
            {accuracy === null ? "—" : `${accuracy}%`}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {stats.totalCorrect}/{stats.totalQuestions} câu đúng (7 ngày qua)
          </p>
        </Card>
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Brain size={16} weight="duotone" /> Từ đã thuộc
          </p>
          <p className="mt-1 text-3xl font-bold">{loaded.masteredCards}</p>
          <p className="mt-0.5 text-xs text-muted">
            trên {loaded.totalCards} thẻ đang ôn · “thuộc” = cách nhau ≥1 ngày
          </p>
        </Card>
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Books size={16} weight="duotone" /> Buổi đã học
          </p>
          <p className="mt-1 text-3xl font-bold">{stats.totalSessions}</p>
          <p className="mt-0.5 text-xs text-muted">
            {stats.reviewCardsDone} lượt ôn thẻ SRS
          </p>
        </Card>
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Sparkle size={16} weight="duotone" /> Buổi hoàn hảo
          </p>
          <p className="mt-1 text-3xl font-bold">{stats.perfectSession ? "Có" : "Chưa"}</p>
          <p className="mt-0.5 text-xs text-muted">một buổi ≥10 câu đúng trọn vẹn</p>
        </Card>
      </FadeIn>

      <FadeIn>
        <h2 className="mb-3 flex items-center gap-2 font-bold">
          <Medal size={18} weight="duotone" className="text-butter" /> Huy hiệu
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allBadges.map((b) => (
            <div
              key={b.id}
              className={`rounded-3xl border p-5 shadow-soft ${
                b.earned ? "border-butter-vivid bg-butter-soft/60" : "border-border bg-surface opacity-80"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold">{b.name}</p>
                {b.earned && <Trophy size={18} weight="duotone" className="text-butter" />}
              </div>
              <p className="mt-0.5 text-xs text-muted">{b.description}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${b.earned ? "bg-butter-vivid" : "bg-primary"}`}
                  style={{ width: `${Math.min(100, Math.round((b.current / b.target) * 100))}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                {Math.min(b.current, b.target)}/{b.target}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

export default function StatsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Thống kê của bạn</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Tiến độ được tính theo ngày học ở múi giờ Việt Nam.
      </p>
      <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}
