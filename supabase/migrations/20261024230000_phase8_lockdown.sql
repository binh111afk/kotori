-- Phase 8: siết quyền cuối — client không tự ghi profiles/schema_migrations.

-- Tạo profile là việc của trigger on_auth_user_created (SECURITY DEFINER),
-- client không cần INSERT profiles.
revoke insert on public.profiles from authenticated, anon;

-- Bảng tracking migration chỉ dành cho tooling (postgres role).
revoke all on public.schema_migrations from authenticated, anon;
