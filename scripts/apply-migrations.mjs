// Chạy các file SQL trong supabase/migrations/ lên project Supabase (dùng pooler).
// Cần SUPABASE_DB_PASSWORD trong .env.local. Chỉ dùng cục bộ, không chạy trên Vercel.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const password = env.SUPABASE_DB_PASSWORD;
const projectRef = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;

const migrationsDir = join(root, "supabase", "migrations");
const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

await client.query(
  "create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())",
);
const applied = new Set(
  (await client.query("select name from public.schema_migrations")).rows.map((r) => r.name),
);

// Backfill: phase 1 đã chạy trước khi có bảng tracking.
if (applied.size === 0 && files.includes("20261023000000_phase1_init.sql")) {
  const { rows } = await client.query("select to_regclass('public.profiles') is not null as has");
  if (rows[0].has) {
    await client.query("insert into public.schema_migrations (name) values ($1)", [
      "20261023000000_phase1_init.sql",
    ]);
    applied.add("20261023000000_phase1_init.sql");
    console.log("↷ backfill: 20261023000000_phase1_init.sql (đã có từ Phase 1)");
  }
}

for (const file of files) {
  if (applied.has(file)) {
    console.log(`↷ ${file} (đã áp dụng trước đó)`);
    continue;
  }
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  process.stdout.write(`→ ${file} … `);
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO public.schema_migrations (name) VALUES ($1)", [file]);
    await client.query("COMMIT");
    console.log("OK");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.log("LỖI:", err.message);
    process.exitCode = 1;
    break;
  }
}

await client.end();
