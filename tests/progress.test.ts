import { describe, expect, it } from "vitest";
import { levelFromXp, levelProgress, xpForLevel } from "@/lib/study/level";
import { freezesEarned, nextStreak } from "@/lib/study/streak";

describe("Streak theo giờ Việt Nam", () => {
  it("buổi học đầu tiên → streak 1", () => {
    const r = nextStreak({ lastStudyDate: null, today: "2026-10-24", streakCount: 0, freezes: 3 });
    expect(r.streakCount).toBe(1);
    expect(r.freezeUsed).toBe(false);
  });

  it("học tiếp ngày hôm sau → +1", () => {
    const r = nextStreak({ lastStudyDate: "2026-10-23", today: "2026-10-24", streakCount: 4, freezes: 1 });
    expect(r.streakCount).toBe(5);
    expect(r.freezes).toBe(1);
  });

  it("học trong cùng một ngày → không đổi", () => {
    const r = nextStreak({ lastStudyDate: "2026-10-24", today: "2026-10-24", streakCount: 7, freezes: 2 });
    expect(r.streakCount).toBe(7);
  });

  it("bỏ đúng 1 ngày và còn đóng băng → chuỗi giữ, trừ 1 đóng băng", () => {
    const r = nextStreak({ lastStudyDate: "2026-10-22", today: "2026-10-24", streakCount: 6, freezes: 2 });
    expect(r.streakCount).toBe(7);
    expect(r.freezes).toBe(1);
    expect(r.freezeUsed).toBe(true);
  });

  it("bỏ 1 ngày nhưng hết đóng băng → chuỗi về 1", () => {
    const r = nextStreak({ lastStudyDate: "2026-10-22", today: "2026-10-24", streakCount: 6, freezes: 0 });
    expect(r.streakCount).toBe(1);
  });

  it("bỏ 2 ngày trở lên → chuỗi về 1 dù còn đóng băng", () => {
    const r = nextStreak({ lastStudyDate: "2026-10-20", today: "2026-10-24", streakCount: 9, freezes: 3 });
    expect(r.streakCount).toBe(1);
    expect(r.freezes).toBe(3);
  });

  it("mỗi 7 ngày liên tiếp thưởng 1 đóng băng", () => {
    expect(freezesEarned(7, 6)).toBe(1);
    expect(freezesEarned(8, 7)).toBe(0);
    expect(freezesEarned(14, 13)).toBe(1);
    expect(freezesEarned(6, 5)).toBe(0);
  });
});

describe("Level theo XP", () => {
  it("mốc XP chuẩn", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(49)).toBe(1);
    expect(levelFromXp(50)).toBe(2);
    expect(levelFromXp(200)).toBe(3);
    expect(xpForLevel(2)).toBe(50);
    expect(xpForLevel(3)).toBe(200);
  });

  it("tiến độ giữa hai mốc", () => {
    const p = levelProgress(125); // lv2 (50) → lv3 (200)
    expect(p.level).toBe(2);
    expect(p.ratio).toBeCloseTo((125 - 50) / 150);
  });

  it("xp không âm", () => {
    expect(levelFromXp(-5)).toBe(1);
  });
});
