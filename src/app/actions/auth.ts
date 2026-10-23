"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error?: string; notice?: string };

const emailSchema = z.email("Email chưa đúng định dạng");
const passwordSchema = z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự");
const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng cho Kotori biết tên bạn nhé")
  .max(40, "Tên hiển thị tối đa 40 ký tự");

function friendlyAuthError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Email hoặc mật khẩu chưa đúng.";
  if (message.includes("Email not confirmed"))
    return "Bạn cần bấm link xác nhận trong email trước khi đăng nhập nhé.";
  if (message.includes("already registered"))
    return "Email này đã có tài khoản — thử đăng nhập xem sao.";
  if (message.includes("Password should be at least"))
    return "Mật khẩu cần ít nhất 8 ký tự.";
  if (message.includes("rate limit"))
    return "Bạn thử quá nhiều lần rồi, nghỉ chút rồi thử lại nhé.";
  return "Có lỗi bất ngờ xảy ra, thử lại giúp mình nhé.";
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: friendlyAuthError(error.message) };

  redirect("/hoc");
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = z
    .object({
      displayName: displayNameSchema,
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({
      displayName: formData.get("displayName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.displayName } },
  });
  if (error) return { error: friendlyAuthError(error.message) };

  // Dự án có thể bật xác nhận email: lúc đó chưa có session ngay.
  if (!data.session) {
    return {
      notice:
        "Đã tạo tài khoản! Kiểm tra hộp thư để bấm link xác nhận, rồi đăng nhập nhé.",
    };
  }
  redirect("/hoc");
}

export async function signOutAction(): Promise<AuthFormState | undefined> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: friendlyAuthError(error.message) };
  redirect("/");
}

export async function updateDisplayNameAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = displayNameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Tên chưa hợp lệ." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn chưa đăng nhập." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data })
    .eq("id", user.id);
  if (error) return { error: "Không lưu được tên, thử lại nhé." };

  return { notice: "Đã lưu tên mới!" };
}
