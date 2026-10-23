import { describe, expect, it } from "vitest";
import { checkAnswer, normalizeAnswer } from "@/lib/answer-checker";

describe("normalizeAnswer", () => {
  it("katakana và hiragana hội tụ về một dạng", () => {
    expect(normalizeAnswer("ハイ")).toBe(normalizeAnswer("はい"));
  });

  it("bỏ khoảng trắng và dấu câu", () => {
    expect(normalizeAnswer("じゃ ありません。")).toBe(normalizeAnswer("じゃありません"));
  });

  it("không phân biệt hoa thường", () => {
    expect(normalizeAnswer("KONNICHIWA")).toBe(normalizeAnswer("konnichiwa"));
  });

  it("các biến thể romaji Hepburn hội tụ", () => {
    expect(normalizeAnswer("arigatō")).toBe(normalizeAnswer("arigatou"));
    expect(normalizeAnswer("shi")).toBe(normalizeAnswer("si"));
    expect(normalizeAnswer("chi")).toBe(normalizeAnswer("ti"));
    expect(normalizeAnswer("tsu")).toBe(normalizeAnswer("tu"));
    expect(normalizeAnswer("fu")).toBe(normalizeAnswer("hu"));
    expect(normalizeAnswer("sha")).toBe(normalizeAnswer("sya"));
    expect(normalizeAnswer("cha")).toBe(normalizeAnswer("tya"));
  });

  it("ん gõ kiểu IME (nn, n') vẫn khớp", () => {
    expect(normalizeAnswer("konnichiwa")).toBe(normalizeAnswer("konichiwa"));
    expect(normalizeAnswer("n'")).toBe(normalizeAnswer("n"));
  });
});

describe("checkAnswer", () => {
  it("nhận nhiều biến thể đúng của trợ từ は", () => {
    const accepted = ["は", "wa", "ha"];
    expect(checkAnswer("は", accepted)).toBe(true);
    expect(checkAnswer("WA", accepted)).toBe(true);
    expect(checkAnswer("ha", accepted)).toBe(true);
    expect(checkAnswer("も", accepted)).toBe(false);
  });

  it("nhận kana hoặc kanji cho cùng một từ (qua danh sách accepted)", () => {
    const accepted = ["私", "わたし", "watashi"];
    expect(checkAnswer("わたし", accepted)).toBe(true);
    expect(checkAnswer("私", accepted)).toBe(true);
    expect(checkAnswer("watashi", accepted)).toBe(true);
    expect(checkAnswer("WATASHI", accepted)).toBe(true);
    expect(checkAnswer("あなた", accepted)).toBe(false);
  });

  it("nhận dạng phủ định có/không khoảng trắng", () => {
    const accepted = ["じゃありません", "じゃないです", "ではありません"];
    expect(checkAnswer("じゃありません", accepted)).toBe(true);
    expect(checkAnswer("じゃ ありません", accepted)).toBe(true);
    expect(checkAnswer("じゃないです", accepted)).toBe(true);
    expect(checkAnswer("デハアリマセン", accepted)).toBe(true);
    expect(checkAnswer("でした", accepted)).toBe(false);
  });

  it("trả lời rỗng thì sai", () => {
    expect(checkAnswer("", ["は"])).toBe(false);
    expect(checkAnswer("   ", ["は"])).toBe(false);
  });
});
