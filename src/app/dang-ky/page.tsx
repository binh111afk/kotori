import type { Metadata } from "next";
import Image from "next/image";
import { SignUpForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Đăng ký" };

export default function SignUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-14">
      <Image src="/brand/kotori-mascot.svg" alt="" width={110} height={110} priority />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Gặp Kotori nhé!</h1>
      <p className="mb-8 mt-1 text-center text-sm text-muted">
        Chỉ một phút để bắt đầu lộ trình tiếng Nhật của bạn.
      </p>
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <SignUpForm />
      </div>
    </div>
  );
}
