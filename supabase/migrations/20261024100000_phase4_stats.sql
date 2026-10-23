-- Phase 4: nhật ký học (XP, streak, thống kê) + mục tiêu ngày.

create table public.study_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('quiz', 'review', 'game')),
  item_type text check (item_type in ('kana', 'vocab', 'grammar')),
  correct_count integer not null default 0 check (correct_count >= 0),
  total_count integer not null default 0 check (total_count >= 0),
  xp integer not null default 0 check (xp >= 0 and xp <= 200),
  study_date date not null,
  created_at timestamptz not null default now()
);

comment on table public.study_events is 'Mỗi buổi luyện/ôn/game một dòng. XP được server tính lại từ correct/total — client không tự khai XP.';

alter table public.study_events enable row level security;
create policy "study_events_select_own" on public.study_events
  for select using (auth.uid() = user_id);
create policy "study_events_insert_own" on public.study_events
  for insert with check (auth.uid() = user_id);
-- không có update/delete: nhật ký học chỉ append.

create index study_events_user_date_idx on public.study_events (user_id, study_date);

alter table public.profiles add column if not exists daily_goal_xp integer not null default 30 check (daily_goal_xp in (10, 20, 30, 50));
