"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowClockwise, House } from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/button";
import type { StudyEventResult } from "@/app/actions/study";
import { cn } from "@/lib/cn";

export interface GameOutcome {
  /** Điểm hiển thị của game (đã tính combo/phạt theo luật từng game). */
  score: number;
  correct: number;
  total: number;
}

export function GameFinish({
  gameName,
  outcome,
  xpResult,
  onReplay,
}: {
  gameName: string;
  outcome: GameOutcome;
  xpResult: StudyEventResult | null;
  onReplay: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-md px-4 py-14 text-center">
      <motion.div
        initial={reduce ? false : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <p className="text-sm font-semibold text-muted">{gameName}</p>
        <p className="mt-1 text-6xl font-bold text-primary-text">{outcome.score}</p>
        <p className="mt-1 font-semibold">
          Đúng {outcome.correct}/{outcome.total}
        </p>
        {xpResult?.ok && (
          <motion.p
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 15 }}
            className="mt-3 inline-block rounded-full bg-butter-soft px-4 py-1.5 text-sm font-bold text-butter"
          >
            +{xpResult.xpGained} XP
          </motion.p>
        )}
        {xpResult?.levelUp && (
          <p className="mt-3 rounded-2xl bg-mint-soft px-4 py-2 text-sm font-bold text-mint">
            Lên cấp {xpResult.newLevel}! Tuyệt vời!
          </p>
        )}
        {xpResult?.ok && xpResult.streak > 1 && (
          <p className="mt-2 text-xs text-muted">Streak hiện tại: {xpResult.streak} ngày</p>
        )}
      </motion.div>

      <p className="mt-4 text-sm text-muted">
        {outcome.correct === outcome.total
          ? "Không sót gì cả — chơi lại để phá kỷ lục điểm nhé!"
          : "Những từ vừa sai đã được Kotori ghi vào hàng ôn tập của ngày mai."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Button size="lg" onClick={onReplay}>
          <ArrowClockwise size={18} weight="duotone" />
          Chơi lại
        </Button>
        <ButtonLink href="/choi" variant="soft" size="lg">
          <House size={18} weight="duotone" />
          Về sảnh game
        </ButtonLink>
      </div>
    </div>
  );
}

export function GameStat({ label, value, tone }: { label: string; value: string | number; tone?: "danger" | "mint" | "butter" }) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "text-lg font-bold leading-none",
          tone === "danger" && "text-danger-text",
          tone === "mint" && "text-mint",
          tone === "butter" && "text-butter",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
