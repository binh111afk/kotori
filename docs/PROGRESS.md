# PROGRESS.md — Context dự án Kotori (đọc trước khi làm việc mới)

App học tiếng Nhật fullstack cho người Việt, tên **Kotori (コトリ)** — **ĐÃ HOÀN TẤT CẢ 8 PHASE + mở rộng từ vựng (2026-10-24), production: https://kotori-theta.vercel.app**. Phát triển tiếp (mở rộng nội dung, tính năng mới) vẫn theo quy tắc: chạy được → báo cáo → chờ user duyệt.

## Quy ước bắt buộc của dự án
- Giao diện + microcopy **tiếng Việt**; nội dung học tiếng Nhật (furigana bằng `<ruby>`, romaji, nghĩa tiếng Việt).
- **Mọi mục nội dung phải có `source` và `verified: boolean`** — validate tự động đối chiếu JMdict (`node scripts/validate-content.mjs` — 405/405 khớp).
- **Không tự vẽ mascot/illustration/asset** — brand assets user cung cấp đã ở `public/brand/` (mascot animated SVG dùng qua `<img>`).
- **Đáp án bài tập phải đúng**: nhiều biến thể (kana/kanji/romaji, trợ từ lược), giải thích tiếng Việt.
- Vitest + Playwright phải pass trước deploy.

## Tech stack & kiến trúc (đang chạy)
Next.js 16 App Router + TS + Tailwind v4 (tokens `globals.css`, dark `.dark` + no-flash script) + Framer Motion; Supabase (`@supabase/ssr`, 9 migrations qua `scripts/apply-migrations.mjs`); XP/streak tính trong **RPC `record_study_event` SECURITY DEFINER** — client bị REVOKE (profiles chỉ UPDATE 3 cột: display_name/settings/daily_goal_xp; study_events append-only qua RPC; schema_migrations khoá). Next 16 notes: `src/proxy.ts`, Cache Components → Suspense quanh phần động, `instant = false` cho route DB động, Phosphor `/dist/ssr` trong Server Component, không truyền function prop Server→Client (dùng client wrapper).

## Nội dung hiện có (đã seed DB, validate 184/184 JMdict)
- Kana: 184 chữ, 10 unit, nét KanjiVG (`gen-kana.mjs`)
- Từ vựng: **405 từ / 16 unit** (U1–U8 lõi + U9–U16 mở rộng: động từ, tính từ, cơ thể, thời tiết, nhà cửa, thành phố, lịch/gia đình)
- Ngữ pháp: **39 điểm / 8 unit** + 77 bài tập 5 loại (files `grammar-n5*.json`)
- Kanji N5: **100 chữ** (nghĩa, on/kun, từ ghép, nét) — `/kanji` + quiz + SRS (`gen-kanji.mjs`)
- Nghe: **4 bài** (mẹo + hội thoại furigana + 20 bài tập có audio) — `/nghe`
- Games: 4 (`/choi`) — XP kind="game", sai → SRS

## Trạng thái các phase
Phase 0–8: **ĐÃ HOÀN TẤT** (0 nghiên cứu · 1 nền tảng · 2 kana+SRS · 3 bài tập+ngữ pháp · 4 streak/XP/badge/stats · 5 games · 6 luyện nghe · 7 kanji+PWA · 8 U4–U8+Playwright+security review). Chi tiết kiến trúc bảo mật: RPC SECURITY DEFINER đã verify E2E chống gian lận XP; Playwright 7/7; Vitest 28/28.

## Việc còn lại (tăng trưởng nội dung & nâng cấp — chưa làm)
- Từ vựng tới mục tiêu ~800 từ N5 (hiện 405 — còn ~400 từ nữa)
- Furigana segments cho câu ví dụ từ vựng (hiện dòng đọc dưới câu)
- Bài nghe 5+ theo U4–U8; audio thu sẵn/TTS API thay Web Speech
- Google OAuth (cần: 2 Redirect URLs trong Supabase Auth + OAuth credentials)
- Bảng xếp hạng (tuỳ chọn), shop đóng băng, time-tracking stats

## Cần từ user (chưa có)
- Google Cloud OAuth credentials (khi muốn đăng nhập Google)
- Audio thu sẵn mp3/ogg nếu muốn thay Web Speech

## Hạ tầng
- Supabase `cdvhrjmyfomunucqtbdf` (Singapore), keys trong `.env.local` (gitignored), Confirm email TẮT
- Vercel project `kotori` (CLI đã login), production alias **kotori-theta.vercel.app**
- Tài khoản xem thử: kotori-xemthu@example.com / xemthu-123 (user test khác: pw-*, kotori-p4/e2e/sec-* — xoá được trong Dashboard → Authentication)
