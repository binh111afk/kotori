-- Phase 7: bảng kanji + SRS nhận thêm loại thẻ kanji.

create table public.kanji (
  id text primary key,
  level text not null default 'n5',
  char text not null unique,
  meaning_vi text not null,
  on_reading text[] not null default '{}',
  kun_reading text[] not null default '{}',
  stroke_count integer not null check (stroke_count > 0),
  examples jsonb not null default '[]'::jsonb,
  source text not null,
  verified boolean not null default false,
  order_index integer not null
);

comment on table public.kanji is 'Kanji N5 — nghĩa tiếng Việt do Kotori biên soạn đối chiếu KANJIDIC2; nét từ KanjiVG.';

alter table public.kanji enable row level security;
create policy "kanji_read_public" on public.kanji
  for select using (true);

alter table public.srs_cards drop constraint srs_cards_item_type_check;
alter table public.srs_cards add constraint srs_cards_item_type_check
  check (item_type in ('kana', 'vocab', 'kanji'));
