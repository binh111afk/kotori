"use client";

import { createClient } from "@/lib/supabase/client";
import { newCardState } from "@/lib/srs/sm2";

export interface WrongItem {
  itemType: "kana" | "vocab" | "kanji";
  itemId: string;
}

/**
 * Trả lời sai ở bài luyện/game → thẻ vào hàng ôn tập:
 * thẻ chưa có thì tạo mới (due ngay), thẻ có sẵn thì dời lên sau 10 phút.
 */
export async function recordWrongAnswers(userId: string, items: WrongItem[]) {
  if (!items.length) return;
  const sb = createClient();
  const { data: existing } = await sb
    .from("srs_cards")
    .select("item_type,item_id")
    .eq("user_id", userId)
    .in(
      "item_id",
      items.map((i) => i.itemId),
    );
  const known = new Set((existing ?? []).map((r) => `${r.item_type}:${r.item_id}`));

  const missing = items.filter((i) => !known.has(`${i.itemType}:${i.itemId}`));
  if (missing.length) {
    await sb.from("srs_cards").insert(
      missing.map((i) => {
        const s = newCardState();
        return {
          user_id: userId,
          item_type: i.itemType,
          item_id: i.itemId,
          ease: s.ease,
          interval_days: s.intervalDays,
          repetitions: s.repetitions,
          lapses: s.lapses,
        };
      }),
    );
  }

  const revisit = items.filter((i) => known.has(`${i.itemType}:${i.itemId}`));
  const dueSoon = new Date(Date.now() + 10 * 60_000).toISOString();
  for (const i of revisit) {
    await sb
      .from("srs_cards")
      .update({ due_at: dueSoon })
      .eq("user_id", userId)
      .eq("item_type", i.itemType)
      .eq("item_id", i.itemId);
  }
}
