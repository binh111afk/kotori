-- Phase 9: bài đọc hiểu (đọc công khai; bài tập tái dùng bảng exercises).

create table public.reading_lessons (
  id text primary key,
  unit_id text not null,
  level text not null default 'n5',
  title text not null,
  topic text not null,
  vocabulary jsonb not null default '[]'::jsonb,
  passages jsonb not null default '[]'::jsonb,
  source text not null,
  verified boolean not null default false,
  order_index integer not null
);

comment on table public.reading_lessons is 'Bài đọc hiểu: passages (đoạn văn có furigana + dịch), vocabulary (từ mới trong bài). Bài tập nằm trong bảng exercises với unit_id trùng.';

alter table public.reading_lessons enable row level security;
create policy "reading_read_public" on public.reading_lessons
  for select using (true);
