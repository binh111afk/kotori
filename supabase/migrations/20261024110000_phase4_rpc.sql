-- Phase 4b: XP/streak chạy 100% trong DB (SECURITY DEFINER), client không tự sửa được.

-- 1) Client KHÔNG được sửa trực tiếp các cột nhạy cảm của profiles.
revoke update on public.profiles from authenticated;
grant update (display_name, settings, daily_goal_xp) on public.profiles to authenticated;

-- 2) Client cũng không được tự ghi nhật ký học (chỉ hàm dưới đây ghi).
revoke insert on public.study_events from authenticated;

-- 3) Hàm ghi một buổi học: tính XP, streak, đóng băng — atomic, chống race.
create or replace function public.record_study_event(
  p_kind text,
  p_item_type text,
  p_correct integer,
  p_total integer
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_last date;
  v_streak integer;
  v_freezes integer;
  v_goal integer;
  v_old_xp integer;
  v_new_xp integer;
  v_xp integer;
  v_freeze_used boolean := false;
  v_bonus integer := 0;
  v_level_before integer;
  v_level_after integer;
  v_today_xp integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_kind not in ('quiz', 'review', 'game')
     or (p_item_type is not null and p_item_type not in ('kana', 'vocab', 'grammar'))
     or p_correct < 0 or p_total < 0 or p_correct > 200 or p_total > 200
     or p_correct > p_total then
    raise exception 'invalid_payload';
  end if;

  -- XP do DB tính — client không khai.
  v_xp := least(200, greatest(0, p_correct * 2 + case when p_total >= 10 and p_correct = p_total then 5 else 0 end));

  insert into public.study_events (user_id, kind, item_type, correct_count, total_count, xp, study_date)
  values (v_uid, p_kind, p_item_type, p_correct, p_total, v_xp, v_today);

  select xp, streak_count, streak_freezes, last_study_date, daily_goal_xp
    into v_old_xp, v_streak, v_freezes, v_last, v_goal
  from public.profiles where id = v_uid;

  if v_last = v_today then
    -- hôm nay đã học: giữ nguyên chuỗi
  elsif v_last is null then
    v_streak := 1;
  else
    if (v_today - v_last) = 1 then
      v_streak := v_streak + 1;
    elsif (v_today - v_last) = 2 and v_freezes > 0 then
      v_streak := v_streak + 1;
      v_freezes := v_freezes - 1;
      v_freeze_used := true;
    else
      v_streak := 1;
    end if;
    -- mỗi tuần liên tiếp thưởng 1 đóng băng (tối đa 5)
    if floor(v_streak / 7.0)::int > floor((v_streak - 1) / 7.0)::int then
      v_bonus := 1;
    end if;
    v_freezes := least(5, v_freezes + v_bonus);
  end if;

  v_new_xp := v_old_xp + v_xp;
  v_level_before := floor(sqrt(greatest(v_old_xp, 0) / 50.0))::int + 1;
  v_level_after := floor(sqrt(greatest(v_new_xp, 0) / 50.0))::int + 1;

  update public.profiles
    set xp = v_new_xp,
        streak_count = v_streak,
        streak_freezes = v_freezes,
        last_study_date = v_today
  where id = v_uid;

  select coalesce(sum(xp), 0) into v_today_xp
  from public.study_events
  where user_id = v_uid and study_date = v_today;

  return json_build_object(
    'ok', true,
    'xpGained', v_xp,
    'totalXp', v_new_xp,
    'levelUp', v_level_after > v_level_before,
    'newLevel', v_level_after,
    'streak', v_streak,
    'freezes', v_freezes,
    'freezeUsed', v_freeze_used,
    'goalReached', v_today_xp >= v_goal,
    'todayXp', v_today_xp
  );
end $$;
