# Kotori — Học tiếng Nhật mỗi ngày

Web học tiếng Nhật cho người Việt: kana, từ vựng, kanji, ngữ pháp, luyện nghe, game — theo lộ trình JLPT N5, nhớ lâu nhờ ôn tập ngắt quãng (SRS). Cài được dạng PWA trên điện thoại.

> **Trạng thái:** 8/8 phase hoàn tất. Nội dung hiện có: 184 kana (10 unit) · 184 từ vựng (8 unit) · 39 điểm ngữ pháp · 97 bài tập · 4 bài nghe · 100 kanji N5. Xem [docs/PROGRESS.md](docs/PROGRESS.md) và [docs/ROADMAP_RESEARCH.md](docs/ROADMAP_RESEARCH.md).

## Tech stack

- **Next.js 16** (App Router) + TypeScript + **Tailwind CSS v4** + **Framer Motion**
- **Supabase**: Postgres + Auth + Row Level Security (`@supabase/ssr`); schema bằng SQL migrations trong `supabase/migrations/`; XP/streak tính trong RPC `record_study_event` (SECURITY DEFINER)
- **Zod** (validate) · **Vitest** (28 unit tests: SRS, chấm đáp án, streak/level) · **Playwright** (7 e2e: landing, đăng ký→học→luyện→thống kê, kanji, nghe, game)
- Deploy **Vercel** · Icon Phosphor (duotone) · Font Quicksand (Việt) + Zen Maru Gothic (Nhật)

## Chạy từ đầu

1. **Cài & chạy local**

   ```bash
   npm install
   cp .env.example .env.local   # điền URL + publishable key từ Supabase Dashboard
   npm run dev                  # http://localhost:3000
   ```

2. **Tạo project Supabase** ([supabase.com](https://supabase.com), gói Free, region Singapore) → lấy `Project URL` + `publishable key` ở Project Settings → API. Điền vào `.env.local` cùng `SUPABASE_DB_PASSWORD` (Settings → Database).

3. **Chạy migration + nội dung**

   ```bash
   node scripts/apply-migrations.mjs   # schema + RLS + RPC (bảng schema_migrations tự track)
   node scripts/seed-content.mjs       # seed kana/từ vựng/ngữ pháp/kanji/bài nghe
   node scripts/validate-content.mjs   # kiểm chứng nội dung (đối chiếu JMdict)
   ```

4. **Cấu hình Auth** — Dashboard → Authentication → URL Configuration: thêm `http://localhost:3000/**` + domain Vercel vào Redirect URLs. Tắt "Confirm email" nếu muốn đăng ký dùng ngay.

5. **Test**

   ```bash
   npm test              # 28 unit tests
   npx playwright test   # 7 e2e (tự start server ở port 3100)
   ```

6. **Deploy Vercel** — `npx vercel` (đã login), thêm env `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` cho Production/Preview.

## Cấu trúc

```
src/
  app/            # / landing, /dang-nhap, /dang-ky, /hoc (+[unitId]), /kanji,
                  # /nghe (+[lesson]), /on-tap, /choi (+[game]), /ho-so, /thong-ke, /nguon
  actions/        # server actions: auth, recordStudyEvent (gọi RPC), mục tiêu ngày
  components/     # study/ (flashcard, exercise, listening, kanji, SRS), games/, landing/, ui/
  lib/            # srs/sm2 · answer-checker · audio/speech · study/ (streak, level, badges, stats)
  proxy.ts        # làm mới phiên Supabase (Next 16 proxy)
supabase/migrations/  # 9 file SQL: schema, RLS, RPC record_study_event, lockdown
scripts/         # apply-migrations · seed-content · validate-content · gen-kana · gen-kanji
docs/            # ROADMAP_RESEARCH (lộ trình nội dung) + PROGRESS (context)
public/brand/    # logo, mascot (SVG animated), app icon
```

## Bảo mật

- **Mọi bảng dữ liệu người dùng bật RLS**: srs_cards/study_events chỉ select/insert của chính mình (study_events không update/delete — append-only); profiles chỉ update 3 cột (display_name/settings/daily_goal_xp) — **xp/streak client không tự sửa được**.
- XP/streak tính trong RPC `record_study_event` (SECURITY DEFINER): client gửi correct/total, DB tự tính XP, kiểm tra payload, cập nhật streak theo múi giờ Asia/Ho_Chi_Minh, tự thưởng/trừ đóng băng.
- Chỉ publishable key trên client; DB password chỉ trong `.env.local` (gitignored); không có service_role trong code.
- Nội dung học (vocab/grammar/kanji/listening/exercises) là read-only công khai.

## Nguồn dữ liệu mở

JMdict/KANJIDIC2 (EDRDG, CC BY-SA 4.0) · KanjiVG (CC BY-SA 3.0) · Tatoeba (CC BY 2.0 FR) · danh sách JLPT cộng đồng. Chi tiết: trang [`/nguon`](src/app/nguon/page.tsx).
