// Sinh src/content/kana.json (184 kana + unit) và src/content/kana-strokes.json
// (thứ tự nét từ KanjiVG, CC BY-SA 3.0 © Ulrich Apel). Chạy: node scripts/gen-kana.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kanjivgDir = process.env.KANJIVG_DIR ?? "C:/Users/Lenovo/AppData/Local/Temp/kanjivg/kanjivg-master/kanji";
if (!existsSync(kanjivgDir)) {
  console.error("Không thấy KanjiVG ở", kanjivgDir, "— giải nén zip trước.");
  process.exit(1);
}

// [char, romaji] — bảng chuẩn Hepburn dùng trong lớp học
const rows = {
  base: [
    ["あ行", [["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"]]],
    ["か行", [["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]]],
    ["さ行", [["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"]]],
    ["た行", [["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"]]],
    ["な行", [["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"]]],
    ["は行", [["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"]]],
    ["ま行", [["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"]]],
    ["や行", [["や", "ya"], ["ゆ", "yu"], ["よ", "yo"]]],
    ["ら行", [["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"]]],
    ["わ行", [["わ", "wa"], ["を", "wo"], ["ん", "n"]]],
  ],
  dakuten: [
    ["が行", [["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"]]],
    ["ざ行", [["ざ", "za"], ["じ", "ji"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"]]],
    ["だ行", [["だ", "da"], ["ぢ", "ji"], ["づ", "zu"], ["で", "de"], ["ど", "do"]]],
    ["ば行", [["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"]]],
    ["ぱ行", [["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"]]],
  ],
  youon: [
    ["き行", [["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"]]],
    ["し行", [["しゃ", "sha"], ["しゅ", "shu"], ["しょ", "sho"]]],
    ["ち行", [["ちゃ", "cha"], ["ちゅ", "chu"], ["ちょ", "cho"]]],
    ["に行", [["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"]]],
    ["ひ行", [["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"]]],
    ["み行", [["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"]]],
    ["り行", [["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"]]],
  ],
};

const hiragana = {
  base: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
  dakuten: "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ",
  youon: "きゃきゅきょしゃしゅしょちゃちゅちょにゃにゅにょひゃひゅひょみゃみゅみょりゃりゅりょ",
};
const katakana = {
  base: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
  dakuten: "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ",
  youon: "キャキュキョシャシュショチャチュチョニャニュニョヒャヒュヒョミャミュミョリャリュリョ",
};

// Ghép an toàn: xây danh sách romaji song song theo đúng cấu trúc bảng
function romajiSeq(kind) {
  const seq = [];
  for (const [, pairs] of rows[kind]) for (const [, r] of pairs) seq.push(r);
  return seq;
}
function charsSeq(str, kind) {
  // yōon là 2 codepoint/char, dakuten/base là 1
  const size = kind === "youon" ? 2 : 1;
  const out = [];
  for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

function buildKana(script) {
  const src = script === "hiragana" ? hiragana : katakana;
  const items = [];
  for (const kind of ["base", "dakuten", "youon"]) {
    const chars = charsSeq(src[kind], kind);
    const roms = romajiSeq(kind);
    if (chars.length !== roms.length) throw new Error(`Lệch bảng ${script}/${kind}`);
    chars.forEach((ch, i) => {
      const k = kind;
      let row = "";
      for (const [rowName, pairs] of rows[kind]) {
        if (pairs.some(([, r]) => r === roms[i])) row = rowName;
      }
      items.push({
        char: ch,
        romaji: roms[i],
        script,
        kind: k,
        row,
        codepoints: [...ch].map((c) => c.codePointAt(0).toString(16).padStart(5, "0")),
      });
    });
  }
  return items;
}

const all = [...buildKana("hiragana"), ...buildKana("katakana")];

// Unit theo lộ trình đã duyệt
const baseRowUnit = { あ: "k1", か: "k1", さ: "k2", た: "k2", な: "k3", は: "k3", ま: "k4", や: "k4", ら: "k5", わ: "k5" };
const unitOf = (it) => {
  const h = it.script === "hiragana";
  if (it.kind === "base") {
    if (h) return baseRowUnit[it.row[0]] ?? "k5"; // ん thuộc k5
    return "k8";
  }
  if (it.kind === "dakuten") return h ? "k6" : "k9";
  return h ? "k7" : "k9";
};
const units = {
  k1: { title: "Hiragana — あ行・か行", order: 1 },
  k2: { title: "Hiragana — さ行・た行", order: 2 },
  k3: { title: "Hiragana — な行・は行", order: 3 },
  k4: { title: "Hiragana — ま行・や行", order: 4 },
  k5: { title: "Hiragana — ら行・わをん", order: 5 },
  k6: { title: "Hiragana — dakuten & handakuten (゛゜)", order: 6 },
  k7: { title: "Hiragana — âm ghép yōon", order: 7 },
  k8: { title: "Katakana — bảng cơ bản", order: 8 },
  k9: { title: "Katakana — dakuten & yōon", order: 9 },
  k10: { title: "Ôn tổng hai bảng kana", order: 10 },
};

const items = all.map((it, i) => ({ ...it, unit_id: unitOf(it), order_index: i + 1 }));

// Trích nét viết từ KanjiVG (theo codepoint, yōon ghép nối tiếp)
function strokePaths(codepoint) {
  const file = join(kanjivgDir, `${codepoint}.svg`);
  if (!existsSync(file)) return null;
  const svg = readFileSync(file, "utf8");
  const paths = [...svg.matchAll(/<path[^>]*id="kvg:[0-9a-fA-F]+-s(\d+)"[^>]*d="([^"]+)"/g)];
  if (!paths.length) {
    // một số file để id trước d hoặc ngược thứ tự thuộc tính
    return [...svg.matchAll(/<path[^>]*d="([^"]+)"[^>]*id="kvg:[0-9a-fA-F]+-s(\d+)"/g)]
      .sort((a, b) => Number(a[2]) - Number(b[2]))
      .map((m) => m[1]);
  }
  return paths.sort((a, b) => Number(a[1]) - Number(b[1])).map((m) => m[2]);
}

const strokes = {};
let missing = [];
for (const it of items) {
  const parts = [];
  for (const cp of it.codepoints) {
    const p = strokePaths(cp);
    if (!p) missing.push(`${it.char} (${cp})`);
    else parts.push(...p);
  }
  strokes[it.char] = { strokes: parts };
}

mkdirSync(join(root, "src", "content"), { recursive: true });
writeFileSync(join(root, "src", "content", "kana.json"), JSON.stringify({ units, items }, null, 1));
writeFileSync(join(root, "src", "content", "kana-strokes.json"), JSON.stringify(strokes));

console.log(`kana: ${items.length} chữ, ${Object.keys(units).length} unit`);
console.log(`strokes: ${Object.values(strokes).filter((s) => s.strokes.length > 0).length} chữ có nét`);
if (missing.length) console.log("THIẾU nét:", missing.join(", "));
