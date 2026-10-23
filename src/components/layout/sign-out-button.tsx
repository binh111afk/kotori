"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SignOut } from "@phosphor-icons/react";
import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function handleSignOut() {
    setError(false);
    startTransition(async () => {
      const result = await signOutAction();
      if (result?.error) {
        setError(true);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      aria-label="Đăng xuất"
      title={error ? "Không đăng xuất được, thử lại nhé" : "Đăng xuất"}
      className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-danger-text"
    >
      <SignOut size={20} weight="duotone" />
    </button>
  );
}
