// SRS — SM-2 rút gọn cho Kotori.
// Điểm đánh giá: again (quên) / hard / good / easy.
// Nâng cấp ts-fsrs khi có dữ liệu ôn thật (xem docs/ROADMAP_RESEARCH.md §3.1).

export type Grade = "again" | "hard" | "good" | "easy";

export interface SrsState {
  ease: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

export interface SrsResult extends SrsState {
  /** Phút cho tới lần ôn tiếp theo (làm tròn lên). */
  dueInMinutes: number;
}

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const MAX_INTERVAL_DAYS = 365;

function clampEase(ease: number) {
  return Math.min(MAX_EASE, Math.max(MIN_EASE, ease));
}

function clampInterval(days: number) {
  return Math.min(MAX_INTERVAL_DAYS, days);
}

export function review(state: SrsState, grade: Grade): SrsResult {
  let { ease, intervalDays, repetitions, lapses } = state;

  if (grade === "again") {
    return {
      ease: clampEase(ease - 0.2),
      intervalDays: 0,
      repetitions: 0,
      lapses: lapses + 1,
      dueInMinutes: 10,
    };
  }

  if (grade === "hard") {
    ease = clampEase(ease - 0.14);
    intervalDays = repetitions === 0 ? 0.5 : clampInterval(intervalDays * 1.2);
  } else if (grade === "good") {
    intervalDays = repetitions === 0 ? 1 : repetitions === 1 ? 6 : clampInterval(intervalDays * ease);
  } else {
    // easy
    ease = clampEase(ease + 0.1);
    intervalDays =
      repetitions === 0 ? 3 : repetitions === 1 ? 8 : clampInterval(intervalDays * ease * 1.3);
  }

  repetitions += 1;
  const dueInMinutes = Math.max(1, Math.ceil(intervalDays * 24 * 60));
  return { ease, intervalDays, repetitions, lapses, dueInMinutes };
}

export function dueAt(now: Date, result: SrsResult): Date {
  return new Date(now.getTime() + result.dueInMinutes * 60_000);
}

/** Thẻ mới chưa từng ôn. */
export function newCardState(): SrsState {
  return { ease: 2.5, intervalDays: 0, repetitions: 0, lapses: 0 };
}
