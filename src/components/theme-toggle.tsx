"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("kotori-theme", next ? "dark" : "light");
    } catch {}
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className="grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-surface-2"
    >
      {/* Trước khi hydration xong chưa biết trạng thái — vẽ khung rỗng để tránh nhảy layout */}
      {isDark === null ? (
        <span className="block size-5" />
      ) : isDark ? (
        <Sun size={20} weight="duotone" />
      ) : (
        <Moon size={20} weight="duotone" />
      )}
    </button>
  );
}
