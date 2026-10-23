-- Phase 1: nền tảng — bảng profiles cho thông tin người dùng + RLS.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Bạn ơi',
  settings jsonb not null default '{}'::jsonb,
  xp integer not null default 0 check (xp >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  streak_freezes integer not null default 3 check (streak_freezes between 0 and 5),
  last_study_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Hồ sơ người học: XP, streak, cài đặt (furigana, mục tiêu ngày...) trong settings.';

alter table public.profiles enable row level security;

-- Người dùng chỉ đọc/ghi dữ liệu của chính mình.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- Không có policy delete: hồ sơ chỉ mất khi xoá tài khoản (cascade).

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Tự tạo profile khi có người đăng ký mới (lấy display_name từ metadata đăng ký).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Bạn ơi')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
