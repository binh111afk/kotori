"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface StudyEventResult {
  ok: boolean;
  xpGained: number;
  totalXp: number;
  levelUp: boolean;
  newLevel: number;
  streak: number;
  freezes: number;
  freezeUsed: boolean;
  goalReached: boolean;
  todayXp: number;
}

const empty: StudyEventResult = {
  ok: false,
  xpGained: 0,
  totalXp: 0,
  levelUp: false,
  newLevel: 1,
  streak: 0,
  freezes: 0,
  freezeUsed: false,
  goalReached: false,
  todayXp: 0,
};

const eventSchema = z.object({
  kind: z.enum(["quiz", "review", "game"]),
  itemType: z.enum(["kana", "vocab", "grammar", "kanji"]).nullish(),
  correct: z.number().int().min(0).max(200),
  total: z.number().int().min(0).max(200),
});

/**
 * Ghi một buổi học (luyện/ôn/game). Validate phía server rồi gọi RPC
 * `record_study_event` (SECURITY DEFINER) — XP, streak, đóng băng đều được
 * DB tính lại, client không thể tự khai số liệu.
 */
export async function recordStudyEvent(
  input: z.input<typeof eventSchema>,
): Promise<StudyEventResult> {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return empty;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { kind, itemType, correct, total } = parsed.data;
  const { data, error } = await supabase.rpc("record_study_event", {
    p_kind: kind,
    p_item_type: itemType ?? null,
    p_correct: correct,
    p_total: total,
  });
  if (error || !data) return empty;
  return data as StudyEventResult;
}

const goalSchema = z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(50)]);

export async function updateDailyGoalAction(goal: number): Promise<{ ok: boolean }> {
  const parsed = goalSchema.safeParse(goal);
  if (!parsed.success) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("profiles")
    .update({ daily_goal_xp: parsed.data })
    .eq("id", user.id);
  return { ok: !error };
}
