-- Phase 3: bài học ngữ pháp + kho bài tập (đọc công khai, không lưu dữ liệu người dùng).

create table public.grammar_points (
  id text primary key,
  unit_id text not null,
  level text not null default 'n5',
  title text not null,
  structure text not null,
  explanation_vi text not null,
  mistakes_vi jsonb not null default '[]'::jsonb,
  examples jsonb not null default '[]'::jsonb,
  source text not null,
  verified boolean not null default false,
  order_index integer not null
);

comment on table public.grammar_points is 'Điểm ngữ pháp N5 — giải thích tiếng Việt kèm lỗi hay gặp của người Việt.';

alter table public.grammar_points enable row level security;
create policy "grammar_read_public" on public.grammar_points
  for select using (true);

create table public.exercises (
  id text primary key,
  unit_id text not null,
  grammar_id text references public.grammar_points (id) on delete cascade,
  type text not null check (type in ('fill', 'reorder', 'conjugate', 'match', 'choice')),
  payload jsonb not null,
  explanation_vi text,
  item_ref text,
  source text not null,
  verified boolean not null default false,
  order_index integer not null
);

comment on table public.exercises is 'Bài tập đa dạng: fill (điền/trợ từ), reorder (sắp xếp câu), conjugate (chia từ), match (nối cặp), choice (trắc nghiệm). Payload theo từng type.';

alter table public.exercises enable row level security;
create policy "exercises_read_public" on public.exercises
  for select using (true);
