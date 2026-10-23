// Bộ chấm đáp án "thông minh": chuẩn hoá kana/romaji/dấu câu rồi so khớp
// với danh sách đáp án được chấp nhận (mỗi bài tập khai sẵn nhiều biến thể đúng).

/** Katakana → hiragana (so sánh không phân biệt hai bảng chữ). */
function kataToHira(s: string): string {
  return [...s]
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      return code >= 0x30a1 && code <= 0x30f6 ? String.fromCodePoint(code - 0x60) : ch;
    })
    .join("");
}

/** Chuẩn hoá romaji về một hệ quy chiếu (kunrei-style) để các biến thể Hepburn hội tụ. */
function normalizeRomaji(s: string): string {
  return s
    .replace(/ā/g, "aa")
    .replace(/ī/g, "ii")
    .replace(/ū/g, "uu")
    .replace(/ē/g, "ee")
    .replace(/ō/g, "ou")
    .replace(/chi/g, "ti")
    .replace(/shi/g, "si")
    .replace(/sha/g, "sya")
    .replace(/shu/g, "syu")
    .replace(/sho/g, "syo")
    .replace(/ch/g, "ty") // cha/chu/cho → tya/tyu/tyo
    .replace(/ji/g, "zi")
    .replace(/fu/g, "hu")
    .replace(/tsu/g, "tu")
    .replace(/nn/g, "n")
    .replace(/n'/g, "n");
}

/** Chuẩn hoá một câu trả lời tự do thành dạng so sánh được. */
export function normalizeAnswer(input: string): string {
  let s = input.normalize("NFKC").toLowerCase();
  s = kataToHira(s);
  s = normalizeRomaji(s);
  // bỏ khoảng trắng và dấu câu — "じゃ ありません。" == "じゃありません"
  s = s.replace(/[\s。、．,.,!！?？'’"“”「」（）()\-_·・]/g, "");
  return s;
}

/** Đúng nếu input khớp (sau chuẩn hoá) một trong các đáp án được chấp nhận. */
export function checkAnswer(input: string, accepted: string[]): boolean {
  const normalized = normalizeAnswer(input);
  if (!normalized) return false;
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}
