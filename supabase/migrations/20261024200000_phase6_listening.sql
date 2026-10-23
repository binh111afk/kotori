-- Phase 6: bài luyện nghe (nội dung đọc công khai; bài tập tái dùng bảng exercises).

create table public.listening_lessons (
  id text primary key,
  unit_id text not null,
  level text not null default 'n5',
  title text not null,
  topic text not null,
  theory jsonb not null,
  dialogue jsonb not null,
  source text not null,
  verified boolean not null default false,
  order_index integer not null
);

comment on table public.listening_lessons is 'Bài nghe: theory (mẹo + từ khoá), dialogue (hội thoại có furigana + dịch từng câu). Bài tập ứng dụng nằm trong bảng exercises với unit_id trùng.';

alter table public.listening_lessons enable row level security;
create policy "listening_read_public" on public.listening_lessons
  for select using (true);
