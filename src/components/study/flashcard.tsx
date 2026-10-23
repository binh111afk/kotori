"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/** Thẻ lật 3D: bấm hoặc phím cách để lật. */
export function Flashcard({
  front,
  back,
  className,
}: {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      aria-label="Bấm để lật thẻ"
      className={cn("block w-full [perspective:1200px]", className)}
    >
      <motion.div
        className="relative w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}
        style={{ aspectRatio: "16 / 10" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
    </button>
  );
}
