// Nạp thống kê cho dashboard + trang thống kê (chạy phía server).
import { createClient } from "@/lib/supabase/server";
import { vnDateOffset, vnToday } from "@/lib/study/streak";
import type { StudyStats } from "@/lib/study/badges";

export interface WeekPoint {
  date: string;
  label: string; // "T2"…
  xp: number;
}

export interface LoadedStats {
  profile: {
    display_name: string;
    xp: number;
    streak_count: number;
    streak_freezes: number;
    last_study_date: string | null;
    daily_goal_xp: number;
  };
  stats: StudyStats;
  week: WeekPoint[];
  todayXp: number;
  masteredCards: number;
  totalCards: number;
}

const weekdayLabel = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", { weekday: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(`${date}T12:00:00+07:00`),
  );

export async function loadStats(): Promise<LoadedStats | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, eventsRes, cardsRes, bigEventsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,xp,streak_count,streak_freezes,last_study_date,daily_goal_xp")
      .eq("id", user.id)
      .single(),
    supabase
      .from("study_events")
      .select("kind,correct_count,total_count,xp,study_date")
      .eq("user_id", user.id)
      .gte("study_date", vnDateOffset(6)),
    supabase.from("srs_cards").select("interval_days").eq("user_id", user.id),
    // buổi ≥10 câu (mọi thời gian) để xét huy hiệu "Học chắc"
    supabase
      .from("study_events")
      .select("correct_count,total_count")
      .eq("user_id", user.id)
      .gte("total_count", 10)
      .limit(200),
  ]);

  const profile = profileRes.data;
  if (!profile) return null;

  const events = eventsRes.data ?? [];
  const today = vnToday();

  // 7 ngày gần nhất (cũ → mới)
  const week: WeekPoint[] = Array.from({ length: 7 }, (_, i) => {
    const date = vnDateOffset(6 - i);
    return { date, label: weekdayLabel(date), xp: 0 };
  });
  const byDate = new Map(week.map((w) => [w.date, w]));
  let totalQuestions = 0;
  let totalCorrect = 0;
  let reviewCardsDone = 0;
  for (const e of events) {
    totalQuestions += e.total_count ?? 0;
    totalCorrect += e.correct_count ?? 0;
    if (e.kind === "review") reviewCardsDone += e.total_count ?? 0;
    const point = byDate.get(e.study_date);
    if (point) point.xp += e.xp ?? 0;
  }
  const perfectSession = (bigEventsRes.data ?? []).some(
    (e) => e.correct_count === e.total_count,
  );

  const { count: totalSessions } = await supabase
    .from("study_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const cards = cardsRes.data ?? [];
  const masteredCards = cards.filter((c) => (c.interval_days ?? 0) >= 1).length;

  const todayXp = byDate.get(today)?.xp ?? 0;
  const dailyGoal = profile.daily_goal_xp ?? 30;

  return {
    profile: {
      display_name: profile.display_name ?? "",
      xp: profile.xp ?? 0,
      streak_count: profile.streak_count ?? 0,
      streak_freezes: profile.streak_freezes ?? 0,
      last_study_date: profile.last_study_date ?? null,
      daily_goal_xp: dailyGoal,
    },
    stats: {
      xp: profile.xp ?? 0,
      streak: profile.streak_count ?? 0,
      totalSessions: totalSessions ?? 0,
      totalQuestions,
      totalCorrect,
      reviewCardsDone,
      perfectSession,
      todayXp,
      dailyGoal,
    },
    week,
    todayXp,
    masteredCards,
    totalCards: cards.length,
  };
}
