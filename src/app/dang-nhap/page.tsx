import type { Metadata } from "next";
import Image from "next/image";
import { SignInForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-14">
      <Image src="/brand/kotori-mascot.svg" alt="" width={110} height={110} priority />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Chào bạn trở lại!</h1>
      <p className="mb-8 mt-1 text-center text-sm text-muted">
        Đăng nhập để tiếp tục học cùng Kotori nhé.
      </p>
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <SignInForm />
      </div>
    </div>
  );
}
