// Kiểm tra nội dung học trước khi seed:
// 1) cấu trúc file JSON (kana/vocab/grammar/kanji/listening)
// 2) từ vựng phải tồn tại trong JMdict (EDRDG, CC BY-SA 4.0) — đúng cách đọc hoặc kanji
// Chạy: node scripts/validate-content.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;
const fail = (msg) => {
  failures++;
  console.log("  ✗ " + msg);
};

// ---------- 1) Kana ----------
const kana = JSON.parse(readFileSync(join(root, "src/content/kana.json"), "utf8"));
const strokes = JSON.parse(readFileSync(join(root, "src/content/kana-strokes.json"), "utf8"));
console.log("Kana:");
if (kana.items.length !== 184) fail(`số chữ kana = ${kana.items.length}, kỳ vọng 184`);
const seenChars = new Set();
for (const it of kana.items) {
  if (seenChars.has(it.char)) fail(`trùng chữ: ${it.char}`);
  seenChars.add(it.char);
  if (!it.romaji || !/^[a-zāīūēō]+$/.test(it.romaji)) fail(`romaji lạ: ${it.char} → ${it.romaji}`);
  if (!it.unit_id || !it.codepoints?.length) fail(`thiếu unit/codepoints: ${it.char}`);
  const s = strokes[it.char]?.strokes ?? [];
  if (!s.length) fail(`thiếu nét viết: ${it.char}`);
}
console.log(`  ${kana.items.length} chữ, ${Object.keys(kana.units).length} unit — ${failures === 0 ? "OK" : failures + " lỗi"}`);

// ---------- 2) Vocab: cấu trúc ----------
console.log("Vocab (cấu trúc):");
const vocabFiles = readdirSync(join(root, "src/content")).filter((f) => /^vocab-.*\.json$/.test(f));
const vocab = { words: [], units: [] };
for (const vf of vocabFiles) {
  const d = JSON.parse(readFileSync(join(root, "src/content", vf), "utf8"));
  vocab.words.push(...(d.words ?? []));
  vocab.units.push(...(d.units ?? []));
}
const seenIds = new Set();
const required = ["id", "unit_id", "kana", "romaji", "meaning_vi", "pos", "example_jp", "example_vi", "source"];
const unitIds = new Set(vocab.units.map((u) => u.id));
for (const w of vocab.words) {
  for (const f of required) if (!w[f]) fail(`${w.id}: thiếu trường ${f}`);
  if (seenIds.has(w.id)) fail(`trùng id: ${w.id}`);
  seenIds.add(w.id);
  if (!unitIds.has(w.unit_id)) fail(`${w.id}: unit_id lạ ${w.unit_id}`);
  if (typeof w.verified !== "boolean") fail(`${w.id}: verified phải là boolean`);
}
console.log(`  ${vocab.words.length} từ — cấu trúc ${failures === 0 ? "OK" : "có lỗi"}`);

// ---------- 3) Grammar + Exercises: cấu trúc (nhiều file grammar-*.json) ----------
console.log("Grammar (cấu trúc):");
const grammarFiles = readdirSync(join(root, "src/content")).filter((f) => /^grammar-.*\.json$/.test(f));
const grammarUnitIds = new Set();
const grammarIds = new Set();
const exerciseIds = new Set();
let grammarPointCount = 0;
const segOk = (segs) => Array.isArray(segs) && segs.every((s) => s && typeof s.t === "string");

for (const gf of grammarFiles) {
  const grammar = JSON.parse(readFileSync(join(root, "src/content", gf), "utf8"));
  for (const u of grammar.units ?? []) grammarUnitIds.add(u.id);
  for (const g of grammar.points ?? []) {
    if (grammarIds.has(g.id)) fail(`trùng grammar id: ${g.id}`);
    grammarIds.add(g.id);
    grammarPointCount++;
    if (!grammarUnitIds.has(g.unit_id)) fail(`${g.id}: unit_id lạ ${g.unit_id}`);
    for (const f of ["id", "unit_id", "title", "structure", "explanation_vi", "source"]) if (!g[f]) fail(`${g.id}: thiếu ${f}`);
    if (!Array.isArray(g.mistakes_vi) || g.mistakes_vi.length === 0) fail(`${g.id}: thiếu mistakes_vi`);
    if (!Array.isArray(g.examples) || !g.examples.every((e) => segOk(e.segments) && e.vi)) fail(`${g.id}: examples thiếu segments/vi`);
  }

  for (const x of grammar.exercises ?? []) {
    if (exerciseIds.has(x.id)) fail(`trùng exercise id: ${x.id}`);
    exerciseIds.add(x.id);
    if (!grammarIds.has(x.grammar_id)) fail(`${x.id}: grammar_id lạ ${x.grammar_id}`);
    const p = x.payload ?? {};
    switch (x.type) {
      case "fill":
        if (!p.before && !p.after) fail(`${x.id}: fill thiếu before/after`);
        if (!Array.isArray(p.accepted) || !p.accepted.length) fail(`${x.id}: fill thiếu accepted`);
        if (!p.full || !p.translation) fail(`${x.id}: fill thiếu full/translation`);
        break;
      case "reorder":
        if (!Array.isArray(p.tokens) || p.tokens.length < 3) fail(`${x.id}: reorder cần ≥3 tokens`);
        if (!p.translation) fail(`${x.id}: reorder thiếu translation`);
        break;
      case "conjugate":
        if (!p.base || !Array.isArray(p.accepted) || !p.accepted.length) fail(`${x.id}: conjugate thiếu base/accepted`);
        break;
      case "match":
        if (!Array.isArray(p.pairs) || p.pairs.length < 4) fail(`${x.id}: match cần ≥4 cặp`);
        if (!p.pairs?.every((pr) => pr.jp && pr.vi)) fail(`${x.id}: match cặp thiếu jp/vi`);
        break;
      case "choice":
        if (!Array.isArray(p.options) || p.options.length < 2) fail(`${x.id}: choice cần ≥2 options`);
        if (typeof p.answerIndex !== "number" || p.answerIndex >= p.options.length) fail(`${x.id}: choice answerIndex sai`);
        break;
      default:
        fail(`${x.id}: type lạ ${x.type}`);
    }
  }
}
console.log(`  ${grammarPointCount} điểm ngữ pháp, ${exerciseIds.size} bài tập — ${failures === 0 ? "OK" : "có lỗi"}`);

// ---------- 3b) Kanji: cấu trúc ----------
try {
  const kanji = JSON.parse(readFileSync(join(root, "src/content/kanji-n5.json"), "utf8"));
  const kanjiStrokes = JSON.parse(readFileSync(join(root, "src/content/kanji-strokes.json"), "utf8"));
  console.log("Kanji (cấu trúc):");
  const seenK = new Set();
  for (const k of kanji.items) {
    if (seenK.has(k.char)) fail(`trùng kanji: ${k.char}`);
    seenK.add(k.char);
    if (!k.meaning_vi) fail(`${k.char}: thiếu nghĩa`);
    if (!Array.isArray(k.examples) || k.examples.length < 2) fail(`${k.char}: cần ≥2 từ ghép`);
    if ((kanjiStrokes[k.char]?.strokes ?? []).length === 0) fail(`${k.char}: thiếu nét viết`);
    if (!Array.isArray(k.on_reading) || !Array.isArray(k.kun_reading)) fail(`${k.char}: thiếu readings`);
  }
  console.log(`  ${kanji.items.length} kanji — ${failures === 0 ? "OK" : "có lỗi"}`);
} catch (e) {
  fail("kanji-n5.json không đọc được: " + e.message);
}

// ---------- 3c) Listening: cấu trúc ----------
try {
  const listening = JSON.parse(readFileSync(join(root, "src/content/listening-n5.json"), "utf8"));
  console.log("Listening (cấu trúc):");
  const listeningUnitIds = new Set(listening.units.map((u) => u.id));
  for (const l of listening.lessons) {
    if (!listeningUnitIds.has(l.unit_id)) fail(`${l.id}: unit_id lạ ${l.unit_id}`);
    if (!l.title || !l.topic) fail(`${l.id}: thiếu title/topic`);
    if (!Array.isArray(l.theory?.tips) || l.theory.tips.length < 2) fail(`${l.id}: theory tips < 2`);
    if (!Array.isArray(l.theory?.keywords) || l.theory.keywords.length < 3) fail(`${l.id}: keywords < 3`);
    if (!Array.isArray(l.dialogue?.lines) || l.dialogue.lines.length < 5) fail(`${l.id}: hội thoại < 5 câu`);
    for (const line of l.dialogue?.lines ?? []) {
      if (!line.speaker || !line.vi) fail(`${l.id}: dòng hội thoại thiếu speaker/vi`);
      if (!Array.isArray(line.segments) || !line.segments.every((s) => typeof s.t === "string")) {
        fail(`${l.id}: dòng hội thoại thiếu segments`);
        break;
      }
    }
  }
  console.log(`  ${listening.lessons.length} bài nghe, ${listening.exercises.length} bài tập nghe — ${failures === 0 ? "OK" : "có lỗi"}`);
} catch {
  // file chưa tồn tại ở các phase trước — bỏ qua
}

// ---------- 4) Vocab: đối chiếu JMdict ----------
console.log("Vocab (đối chiếu JMdict):");
const cachePath = process.env.JMDICT_CACHE ?? join(root, ".jmdict-cache.xml");
let xml;
if (existsSync(cachePath)) {
  xml = readFileSync(cachePath, "utf8");
  console.log("  dùng cache JMdict hiện có");
} else {
  console.log("  tải JMdict_e.gz từ EDRDG (~3MB)…");
  const res = await fetch("https://www.edrdg.org/pub/Nihongo/JMdict_e.gz");
  if (!res.ok) {
    console.log("  ✗ không tải được JMdict (HTTP " + res.status + ") — bỏ qua bước này, KHÔNG chặn seed");
    process.exit(failures > 0 ? 1 : 0);
  }
  xml = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
  try {
    writeFileSync(cachePath, xml);
  } catch {}
}

// Chuẩn hoá kana: katakana → hiragana (JMdict ghi từ ngoại lai bằng katakana, seed có thể viết hiragana)
function kataToHira(s) {
  return [...s].map((ch) => {
    const code = ch.codePointAt(0);
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCodePoint(code - 0x60) : ch;
  }).join("");
}

// Hiragana → katakana (chiều ngược của kataToHira)
function hiraToKata(s) {
  return [...s].map((ch) => {
    const code = ch.codePointAt(0);
    return code >= 0x3041 && code <= 0x3096 ? String.fromCodePoint(code + 0x60) : ch;
  }).join('');
}

// Động từ seed ở dạng masu — JMdict lưu nguyên mẫu: suy ra các dạng từ điển khả dĩ.
// godan: đổi nguyên âm hàng cuối (き→く, み→む…); します→する/す; +る cho nhóm 2.
function dictFormCandidates(kana) {
  if (CURATION_EXCEPTIONS[kana]) return CURATION_EXCEPTIONS[kana];
  if (!kana.endsWith("ます")) return [kana];
  const stem = kana.slice(0, -2);
  const last = stem[stem.length - 1];
  const base = stem.slice(0, -1);
  if (last === "し") return [stem.slice(0, -1) + "する", base + "す", base, kana];
  const godan = { き: "く", ぎ: "ぐ", い: "う", ち: "つ", り: "る", み: "む", び: "ぶ" };
  return [...new Set([kana, base + (godan[last] ?? last), stem + "る"]), kana + "する"];
}

// Cặp từ Kotori kiểm chứng tay (JMdict ghi dưới dạng khác/không liệt kê reb)
const CURATION_EXCEPTIONS = {
  いい: ["良い", "よい", "いい"],
  "どうですか": ["どう"],
  できます: ["出来る", "できる"],
  あります: ["有る", "在る", "ある"],
  います: ["居る", "いる"],
  もらいます: ["もらう", "貰う"],
  ならいます: ["習う", "ならう"],
  しっています: ["知る", "しっている"],
  すんでいます: ["住む", "すんでいる"],
  "てつだいます": ["手伝う", "てつだう"],
  "もっていきます": ["持って行く", "もっていく"],
  "もってきます": ["持って来る", "もってくる"],
};

const wordsUnverified = new Map(vocab.words.map((w) => [w.kana, w]));
const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
const kebRe = /<keb>([^<]+)<\/keb>/g;
const rebRe = /<reb>([^<]+)<\/reb>/g;
let wanted = [];
for (const w of vocab.words) {
  for (const c of [...dictFormCandidates(w.kana), ...dictFormCandidates(w.kanji ?? ""), w.kana, w.kanji ?? ""]) {
    if (!c) continue;
    const h = kataToHira(c);
    wanted.push(c);
    if (h !== c) wanted.push(h);
  }
}
wanted = [...new Set(wanted)];
let checked = 0;
let m;

while ((m = entryRe.exec(xml)) !== null && wordsUnverified.size > 0) {
  const block = m[1];
  if (!wanted.some((t) => block.includes(t) || block.includes(kataToHira(t)) || block.includes(hiraToKata(t)))) continue;
  const kebs = [...block.matchAll(kebRe)].map((x) => x[1]);
  const rebs = [...block.matchAll(rebRe)].map((x) => x[1]);
  // allDict chứa cả dạng katakana gốc lẫn hiragana chuẩn hoá — so khớp không phân biệt hai bảng chữ
  const allDict = new Set();
  for (const d of [...kebs, ...rebs]) {
    allDict.add(d);
    const h = kataToHira(d);
    if (h !== d) allDict.add(h);
  }

  for (const [kanaKey, w] of [...wordsUnverified]) {
    const candidates = new Set([
      kanaKey,
      w.kanji ?? "",
      ...dictFormCandidates(kanaKey),
      ...dictFormCandidates(w.kanji ?? ""),
      // dạng です trần (すきです → すき)
      kanaKey.endsWith("です") ? kanaKey.slice(0, -2) : "",
      (w.kanji ?? "").endsWith("です") ? w.kanji.slice(0, -2) : "",
    ]);
    candidates.delete("");
    // so khớp không phân biệt kata/hira: thêm dạng hiragana của từng ứng viên
    const normalized = new Set([...candidates].flatMap((c) => [c, kataToHira(c)]));
    if ([...normalized].some((c) => allDict.has(c))) {
      checked++;
      wordsUnverified.delete(kanaKey);
      break;
    }
  }
}

if (wordsUnverified.size === 0) {
  console.log(`  ${checked}/${vocab.words.length} từ khớp JMdict — OK`);
} else {
  for (const [kanaKey, w] of wordsUnverified) {
    fail(`${w.id} (${kanaKey}${w.kanji ? " / " + w.kanji : ""}): không tìm thấy trong JMdict — xem lại hoặc đánh dấu verified:false`);
  }
}

console.log(failures === 0 ? "\nNội dung hợp lệ ✓" : `\nCÓ ${failures} LỖI — sửa trước khi seed`);
process.exit(failures > 0 ? 1 : 0);
