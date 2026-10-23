"use client";

import { useState, useTransition } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { updateDailyGoalAction } from "@/app/actions/study";
import { cn } from "@/lib/cn";

const options = [10, 20, 30, 50];

export function GoalSetting({ current }: { current: number }) {
  const [selected, setSelected] = useState(current);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(goal: number) {
    setSelected(goal);
    setSaved(false);
    startTransition(async () => {
      const { ok } = await updateDailyGoalAction(goal);
      setSaved(ok);
    });
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">Mục tiêu XP mỗi ngày</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => save(o)}
            disabled={pending}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm font-bold transition-all active:scale-95",
              selected === o
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-surface text-muted hover:text-foreground",
            )}
          >
            {o} XP
          </button>
        ))}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted" role="status">
        {saved ? (
          <>
            <CheckCircle size={13} weight="duotone" className="text-mint" /> Đã lưu mục tiêu mới.
          </>
        ) : (
          "Mục tiêu thấp đều đặn mỗi ngày tốt hơn học dồn cuối tuần."
        )}
      </p>
    </div>
  );
}
