// Đẩy toàn bộ nội dung học (từ vựng + ngữ pháp + bài tập) lên Supabase. Chạy lại được (upsert).
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#") && !l.startsWith("VERCEL_"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const projectRef = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const client = new pg.Client({
  connectionString: `postgresql://postgres.${projectRef}:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const contentDir = join(root, "src", "content");
const files = readdirSync(contentDir).filter((f) => f.endsWith(".json") && /^(vocab|grammar|listening|kanji|reading)-/.test(f) && !f.includes("strokes")).sort();
let vocabCount = 0;
let grammarCount = 0;
let exerciseCount = 0;
let listeningCount = 0;
let kanjiCount = 0;
let readingCount = 0;

for (const file of files) {
  const data = JSON.parse(readFileSync(join(contentDir, file), "utf8"));

  if (file.startsWith("vocab-")) {
    const sql =
      "insert into public.vocab (id, unit_id, level, kana, kanji, romaji, meaning_vi, pos, example_jp, example_reading, example_vi, audio_text, source, verified, order_index) " +
      "values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) " +
      "on conflict (id) do update set unit_id=excluded.unit_id, level=excluded.level, kana=excluded.kana, kanji=excluded.kanji, romaji=excluded.romaji, meaning_vi=excluded.meaning_vi, pos=excluded.pos, example_jp=excluded.example_jp, example_reading=excluded.example_reading, example_vi=excluded.example_vi, audio_text=excluded.audio_text, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index";
    for (const w of data.words) {
      await client.query(sql, [
        w.id,
        w.unit_id,
        "n5",
        w.kana,
        w.kanji ?? null,
        w.romaji,
        w.meaning_vi,
        w.pos,
        w.example_jp,
        w.example_reading ?? null,
        w.example_vi,
        w.kana,
        w.source,
        w.verified,
        parseInt(w.id.split("-")[1], 10) * 100 + vocabCount,
      ]);
      vocabCount++;
    }
  }

  if (file.startsWith("kanji-")) {
    for (const k of data.items) {
      await client.query(
        `insert into public.kanji (id, level, char, meaning_vi, on_reading, kun_reading, stroke_count, examples, source, verified, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         on conflict (id) do update set level=excluded.level, char=excluded.char, meaning_vi=excluded.meaning_vi, on_reading=excluded.on_reading, kun_reading=excluded.kun_reading, stroke_count=excluded.stroke_count, examples=excluded.examples, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index`,
        [k.id, "n5", k.char, k.meaning_vi, k.on_reading, k.kun_reading, k.stroke_count, JSON.stringify(k.examples), k.source, k.verified, k.order_index],
      );
      kanjiCount++;
    }
  }

  if (file.startsWith("reading-")) {
    for (const l of data.lessons) {
      await client.query(
        `insert into public.reading_lessons (id, unit_id, level, title, topic, vocabulary, passages, source, verified, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set unit_id=excluded.unit_id, level=excluded.level, title=excluded.title, topic=excluded.topic, vocabulary=excluded.vocabulary, passages=excluded.passages, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index`,
        [l.id, l.unit_id, "n5", l.title, l.topic, JSON.stringify(l.vocabulary), JSON.stringify(l.passages), l.source, l.verified, l.order_index]
      );
      readingCount++;
    }
    for (const x of data.exercises) {
      await client.query(
        `insert into public.exercises (id, unit_id, grammar_id, type, payload, explanation_vi, item_ref, source, verified, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set unit_id=excluded.unit_id, grammar_id=excluded.grammar_id, type=excluded.type, payload=excluded.payload, explanation_vi=excluded.explanation_vi, item_ref=excluded.item_ref, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index`,
        [x.id, x.unit_id, x.grammar_id ?? null, x.type, JSON.stringify(x.payload), x.explanation_vi ?? null, x.item_ref ?? null, x.source, x.verified, x.order_index ?? exerciseCount]
      );
      exerciseCount++;
    }
  }

  if (file.startsWith('listening-')) {
    for (const l of data.lessons) {
      await client.query(
        `insert into public.listening_lessons (id, unit_id, level, title, topic, theory, dialogue, source, verified, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set unit_id=excluded.unit_id, level=excluded.level, title=excluded.title, topic=excluded.topic, theory=excluded.theory, dialogue=excluded.dialogue, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index`,
        [l.id, l.unit_id, "n5", l.title, l.topic, JSON.stringify(l.theory), JSON.stringify(l.dialogue), l.source, l.verified, l.order_index],
      );
      listeningCount++;
    }
    for (const x of data.exercises) {
      await client.query(
        `insert into public.exercises (id, unit_id, grammar_id, type, payload, explanation_vi, item_ref, source, verified, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set unit_id=excluded.unit_id, grammar_id=excluded.grammar_id, type=excluded.type, payload=excluded.payload, explanation_vi=excluded.explanation_vi, item_ref=excluded.item_ref, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index`,
        [x.id, x.unit_id, x.grammar_id ?? null, x.type, JSON.stringify(x.payload), x.explanation_vi ?? null, x.item_ref ?? null, x.source, x.verified, x.order_index ?? exerciseCount],
      );
      exerciseCount++;
    }
  }

  if (file.startsWith("grammar-")) {
    for (const g of data.points) {
      await client.query(
        `insert into public.grammar_points (id, unit_id, level, title, structure, explanation_vi, mistakes_vi, examples, source, verified, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         on conflict (id) do update set unit_id=excluded.unit_id, level=excluded.level, title=excluded.title, structure=excluded.structure, explanation_vi=excluded.explanation_vi, mistakes_vi=excluded.mistakes_vi, examples=excluded.examples, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index`,
        [g.id, g.unit_id, "n5", g.title, g.structure, g.explanation_vi, JSON.stringify(g.mistakes_vi), JSON.stringify(g.examples), g.source, g.verified, g.order_index ?? grammarCount],
      );
      grammarCount++;
    }
    for (const x of data.exercises) {
      await client.query(
        `insert into public.exercises (id, unit_id, grammar_id, type, payload, explanation_vi, item_ref, source, verified, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set unit_id=excluded.unit_id, grammar_id=excluded.grammar_id, type=excluded.type, payload=excluded.payload, explanation_vi=excluded.explanation_vi, item_ref=excluded.item_ref, source=excluded.source, verified=excluded.verified, order_index=excluded.order_index`,
        [x.id, x.unit_id, x.grammar_id ?? null, x.type, JSON.stringify(x.payload), x.explanation_vi ?? null, x.item_ref ?? null, x.source, x.verified, x.order_index ?? exerciseCount],
      );
      exerciseCount++;
    }
  }
}

console.log(`Đã seed ${vocabCount} từ vựng, ${grammarCount} điểm ngữ pháp, ${exerciseCount} bài tập, ${listeningCount} bài nghe, ${kanjiCount} kanji.`);
await client.end();
