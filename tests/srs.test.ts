import { describe, expect, it } from "vitest";
import { dueAt, newCardState, review } from "@/lib/srs/sm2";

describe("SRS SM-2 rút gọn", () => {
  it("thẻ mới trả lời good → ôn lại sau 1 ngày", () => {
    const r = review(newCardState(), "good");
    expect(r.repetitions).toBe(1);
    expect(r.intervalDays).toBe(1);
    expect(r.dueInMinutes).toBe(24 * 60);
    expect(r.ease).toBe(2.5);
  });

  it("thẻ mới trả lời easy → 3 ngày và ease tăng", () => {
    const r = review(newCardState(), "easy");
    expect(r.intervalDays).toBe(3);
    expect(r.ease).toBe(2.6);
  });

  it("thẻ mới trả lời hard → 12 giờ và ease giảm", () => {
    const r = review(newCardState(), "hard");
    expect(r.intervalDays).toBe(0.5);
    expect(r.ease).toBeCloseTo(2.36);
  });

  it("chuỗi good: 1 ngày → 6 ngày → 15 ngày (nhân ease)", () => {
    let s = review(newCardState(), "good");
    expect(s.intervalDays).toBe(1);
    s = review(s, "good");
    expect(s.intervalDays).toBe(6);
    s = review(s, "good");
    expect(s.intervalDays).toBe(15);
  });

  it("quên (again) → 10 phút, đếm lapse, interval về 0", () => {
    let s = review(newCardState(), "good");
    s = review(s, "good");
    s = review(s, "again");
    expect(s.dueInMinutes).toBe(10);
    expect(s.repetitions).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.intervalDays).toBe(0);
  });

  it("hồi phục sau khi quên: good → 1 ngày rồi 6 ngày như thẻ mới", () => {
    let s = newCardState();
    s = review(s, "good");
    s = review(s, "again");
    s = review(s, "good");
    expect(s.intervalDays).toBe(1);
    s = review(s, "good");
    expect(s.intervalDays).toBe(6);
  });

  it("ease luôn trong [1.3, 2.8]", () => {
    let s = newCardState();
    for (let i = 0; i < 30; i++) s = review(s, "again");
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
    for (let i = 0; i < 30; i++) s = review({ ...s, repetitions: i }, "easy");
    expect(s.ease).toBeLessThanOrEqual(2.8);
  });

  it("interval không vượt 365 ngày", () => {
    let s = { ease: 2.8, intervalDays: 360, repetitions: 20, lapses: 0 };
    s = review(s, "easy");
    expect(s.intervalDays).toBeLessThanOrEqual(365);
  });

  it("dueAt cộng đúng số phút", () => {
    const now = new Date("2026-10-23T10:00:00Z");
    const r = review(newCardState(), "good");
    expect(dueAt(now, r).toISOString()).toBe("2026-10-24T10:00:00.000Z");
  });
});
