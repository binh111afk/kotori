"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FireSimple } from "@phosphor-icons/react";
import { levelProgress } from "@/lib/study/level";
import { cn } from "@/lib/cn";

/** Vòng tiến độ mục tiêu XP hôm nay. */
export function GoalRing({
  todayXp,
  goal,
  size = 84,
}: {
  todayXp: number;
  goal: number;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const ratio = Math.min(1, goal > 0 ? todayXp / goal : 0);
  const reached = ratio >= 1;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={reached ? "var(--mint-vivid)" : "var(--primary)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className={cn("text-lg font-bold leading-none", reached && "text-mint")}>{todayXp}</p>
        <p className="text-[10px] font-medium text-muted">/{goal} XP</p>
      </div>
    </div>
  );
}

/** Lửa streak — nhấp nháy nhẹ khi hôm nay đã học. */
export function StreakFlame({
  streak,
  activeToday,
  freezes,
  size = "md",
}: {
  streak: number;
  activeToday: boolean;
  freezes: number;
  size?: "md" | "lg";
}) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-2">
      <motion.span
        animate={reduce || !activeToday ? {} : { scale: [1, 1.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className={cn(
          "grid place-items-center rounded-full",
          activeToday ? "bg-butter-soft text-butter" : "bg-surface-2 text-muted",
          size === "lg" ? "size-14" : "size-10",
        )}
      >
        <FireSimple weight="duotone" size={size === "lg" ? 30 : 22} />
      </motion.span>
      <div>
        <p className={cn("font-bold leading-none", size === "lg" && "text-2xl")}>{streak}</p>
        <p className="text-xs text-muted">
          ngày liền{freezes > 0 ? ` · ${freezes} đóng băng` : ""}
        </p>
      </div>
    </div>
  );
}
