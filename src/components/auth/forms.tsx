"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signInAction, signUpAction, updateDisplayNameAction } from "@/app/actions/auth";
import type { AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initial: AuthFormState = {};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? pendingLabel : label}
    </Button>
  );
}

function Feedback({ state }: { state: AuthFormState }) {
  if (!state.error && !state.notice) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm ${
        state.error
          ? "bg-danger-soft text-danger-text"
          : "bg-mint-soft text-mint"
      }`}
    >
      {state.error ?? state.notice}
    </p>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted/70 focus:border-primary focus:shadow-soft"
      />
    </label>
  );
}

export function SignInForm() {
  const [state, action] = useActionState(signInAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Feedback state={state} />
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="ban@vidu.com" />
      <Field label="Mật khẩu" name="password" type="password" autoComplete="current-password" />
      <SubmitButton label="Đăng nhập" pendingLabel="Đang đăng nhập…" />
      <p className="text-center text-sm text-muted">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-semibold text-primary-text underline decoration-dotted underline-offset-4">
          Đăng ký cùng Kotori
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Feedback state={state} />
      <Field label="Tên hiển thị" name="displayName" autoComplete="nickname" placeholder="Mai, Hùng, …" />
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="ban@vidu.com" />
      <Field
        label="Mật khẩu"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Ít nhất 8 ký tự"
      />
      <SubmitButton label="Tạo tài khoản" pendingLabel="Đang tạo…" />
      <p className="text-center text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-semibold text-primary-text underline decoration-dotted underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

export function DisplayNameForm({ current }: { current: string }) {
  const [state, action] = useActionState(updateDisplayNameAction, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <Feedback state={state} />
      <Field label="Tên hiển thị" name="displayName" defaultValue={current} />
      <SubmitButton label="Lưu tên" pendingLabel="Đang lưu…" />
    </form>
  );
}
