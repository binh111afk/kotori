-- Phase 2: nội dung từ vựng (đọc công khai) + thẻ ôn tập SRS của người dùng.

create table public.vocab (
  id text primary key,
  unit_id text not null,
  level text not null default 'n5',
  kana text not null,
  kanji text,
  romaji text not null,
  meaning_vi text not null,
  pos text,
  example_jp text,
  example_reading text,
  example_vi text,
  audio_text text not null,
  source text not null,
  verified boolean not null default false,
  order_index integer not null
);

comment on table public.vocab is 'Nội dung học từ vựng — read-only với người dùng, nghĩa tiếng Việt do Kotori biên soạn và đối chiếu JMdict.';

alter table public.vocab enable row level security;
create policy "vocab_read_public" on public.vocab
  for select using (true);

create table public.srs_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('kana', 'vocab')),
  item_id text not null,
  ease real not null default 2.5 check (ease >= 1.3 and ease <= 2.8),
  interval_days real not null default 0,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

comment on table public.srs_cards is 'Thẻ ôn tập SRS (SM-2 rút gọn) — người dùng chỉ thao tác thẻ của chính mình.';

alter table public.srs_cards enable row level security;
create policy "srs_select_own" on public.srs_cards
  for select using (auth.uid() = user_id);
create policy "srs_insert_own" on public.srs_cards
  for insert with check (auth.uid() = user_id);
create policy "srs_update_own" on public.srs_cards
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "srs_delete_own" on public.srs_cards
  for delete using (auth.uid() = user_id);

create trigger srs_cards_set_updated_at
  before update on public.srs_cards
  for each row execute function public.set_updated_at();

create index srs_cards_due_idx on public.srs_cards (user_id, due_at);
