"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* Họa tiết nền: đốm màu pastel mềm, gợi hoa sakura — không gradient tím xanh */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary-soft blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-40 size-72 rounded-full bg-secondary-soft blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/3 top-64 size-40 rounded-full bg-butter-soft blur-2xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:pb-24 md:pt-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-1.5 text-sm font-semibold text-secondary-text">
            こんにちは! Bắt đầu từ con số 0
          </p>
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            Học tiếng Nhật{" "}
            <span className="text-primary-text">10 phút mỗi ngày</span>, nhớ lâu
            hơn học dồn 1 giờ.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            Kana, từ vựng, ngữ pháp, luyện nghe — giải thích tiếng Việt dễ hiểu,
            ôn tập ngắt quãng đúng khoa học, kana sai sẽ tự quay lại cho đến khi
            bạn nhớ.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href="/dang-ky" size="lg">
              Học miễn phí ngay
            </ButtonLink>
            <ButtonLink href="#cach-hoc" variant="soft" size="lg">
              Kotori dạy thế nào?
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-muted">
            Không cần cài đặt · Đủ lộ trình JLPT N5 · Dữ liệu từ nguồn mở có kiểm chứng
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
        >
          <motion.div>
            <Image
              src="/brand/kotori-mascot-animated.svg"
              alt="Kotori — chú chim nhỏ đồng hành cùng bạn học tiếng Nhật"
              width={460}
              height={460}
              priority
              className="mx-auto"
            />
          </motion.div>
          <motion.p
            aria-hidden
            className="absolute -left-2 top-8 rounded-2xl rounded-bl-sm bg-surface px-3.5 py-2 text-sm font-semibold text-secondary-text shadow-soft"
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            ひらがな
            <span className="ml-1 text-xs font-medium text-muted">hi-ra-ga-na</span>
          </motion.p>
          <motion.p
            aria-hidden
            className="absolute -right-1 bottom-10 rounded-2xl rounded-br-sm bg-surface px-3.5 py-2 text-sm font-semibold text-primary-text shadow-soft"
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            +10 XP mỗi ngày
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
