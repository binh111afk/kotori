// Streak tính theo ngày LÀM VIỆC dạng "YYYY-MM-DD" — múi giờ Asia/Ho_Chi_Minh
// được chuyển ở lớp gọi (Server Action), hàm này thuần logic để test dễ.

export interface StreakInput {
  lastStudyDate: string | null; // YYYY-MM-DD
  today: string; // YYYY-MM-DD
  streakCount: number;
  freezes: number;
}

export interface StreakResult {
  streakCount: number;
  freezes: number;
  freezeUsed: boolean;
  /** Ngày liên tiếp mới (đã tính cả đóng băng). */
  continued: boolean;
}

function diffDays(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00Z`).getTime();
  const db = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((db - da) / 86_400_000);
}

export function nextStreak(input: StreakInput): StreakResult {
  const { lastStudyDate, today, freezes } = input;
  let { streakCount } = input;

  // Hôm nay đã học rồi — không đổi.
  if (lastStudyDate === today) {
    return { streakCount, freezes, freezeUsed: false, continued: true };
  }

  // Buổi học đầu tiên.
  if (!lastStudyDate) {
    return { streakCount: 1, freezes, freezeUsed: false, continued: true };
  }

  const gap = diffDays(lastStudyDate, today);

  if (gap === 1) {
    return { streakCount: streakCount + 1, freezes, freezeUsed: false, continued: true };
  }

  if (gap === 2 && freezes > 0) {
    // Bỏ đúng 1 ngày — dùng đóng băng để giữ chuỗi.
    return { streakCount: streakCount + 1, freezes: freezes - 1, freezeUsed: true, continued: true };
  }

  // Bỏ ≥ 2 ngày (hoặc hết đóng băng) — chuỗi về 1.
  return { streakCount: 1, freezes, freezeUsed: false, continued: false };
}

/** Mốc tuần thưởng thêm 1 đóng băng (tối đa 5 — ràng buộc DB). */
export function freezesEarned(newStreak: number, oldStreak: number): number {
  const weeks = (n: number) => Math.floor(n / 7);
  if (weeks(newStreak) > weeks(oldStreak)) return 1;
  return 0;
}

/** Ngày hôm nay theo Asia/Ho_Chi_Minh, dạng YYYY-MM-DD. */
export function vnToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Ngày YYYY-MM-DD của `now` lùi lại `offsetDays` ngày (vẫn theo giờ VN). */
export function vnDateOffset(offsetDays: number, now: Date = new Date()): string {
  return vnToday(new Date(now.getTime() - offsetDays * 86_400_000));
}
