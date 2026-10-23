import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DisplayNameForm } from "@/components/auth/forms";
import { GoalSetting } from "@/components/auth/goal-setting";

export const metadata: Metadata = { title: "Hồ sơ" };

async function ProfileContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, xp, daily_goal_xp, streak_count")
    .eq("id", user.id)
    .single();

  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Hồ sơ của bạn</h1>
      <p className="text-sm text-muted">{user.email}</p>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-xl font-bold text-primary-text">
            {(profile?.display_name || user.email || "?").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-bold">{profile?.display_name || "Bạn ơi"}</p>
            <p className="text-sm text-muted">
              {profile?.xp ?? 0} XP · streak {profile?.streak_count ?? 0} ngày
            </p>
          </div>
        </div>
        <DisplayNameForm current={profile?.display_name ?? ""} />
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <GoalSetting current={profile?.daily_goal_xp ?? 30} />
      </div>

      <p className="text-center text-sm text-muted">
        Xem chi tiết tiến độ ở trang{" "}
        <Link href="/thong-ke" className="font-semibold text-primary-text underline decoration-dotted underline-offset-4">
          Thống kê
        </Link>
        . Huy hiệu đặc biệt sẽ mở thêm từ Phase 5.
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <Suspense fallback={<div aria-hidden className="h-64 w-full animate-pulse rounded-3xl bg-surface-2" />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
