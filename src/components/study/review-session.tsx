"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { dueAt, review, type Grade } from "@/lib/srs/sm2";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { SpeakButton } from "@/components/study/speak-button";
import { Button } from "@/components/ui/button";
import kanaData from "@/content/kana.json";
import { cn } from "@/lib/cn";

interface SrsRow {
  id: string;
  user_id: string;
  item_type: "kana" | "vocab" | "kanji";
  item_id: string;
  ease: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  due_at: string;
}

interface VocabRow {
  id: string;
  kana: string;
  kanji: string | null;
  romaji: string;
  meaning_vi: string;
  example_jp: string | null;
  example_reading: string | null;
  example_vi: string | null;
}

interface KanjiRow {
  id: string;
  char: string;
  meaning_vi: string;
  on_reading: string[];
  kun_reading: string[];
  stroke_count: number;
}

const kanaByChar = new Map(kanaData.items.map((i) => [i.char, i]));
const grades: { key: Grade; label: string; hint: string; classes: string }[] = [
  { key: "again", label: "Lại", hint: "Chưa nhớ", classes: "bg-danger-soft text-danger-text" },
  { key: "hard", label: "Khó", hint: "Lắm lôi", classes: "bg-surface-2 text-muted" },
  { key: "good", label: "Được", hint: "Nhớ được", classes: "bg-secondary-soft text-secondary-text" },
  { key: "easy", label: "Dễ", hint: "Nhớ chắc", classes: "bg-mint-soft text-mint" },
];

export function ReviewSession({ userId }: { userId: string }) {
  const reduce = useReducedMotion();
  const [cards, setCards] = useState<SrsRow[] | null>(null);
  const [vocabMap, setVocabMap] = useState<Map<string, VocabRow>>(new Map());
  const [kanjiMap, setKanjiMap] = useState<Map<string, KanjiRow>>(new Map());
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [nextDue, setNextDue] = useState<string | null>(null);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);
  const correctRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = createClient();
      const now = new Date().toISOString();
      const { data: rows } = await sb
        .from("srs_cards")
        .select("id,item_type,item_id,ease,interval_days,repetitions,lapses,due_at")
        .eq("user_id", userId)
        .lte("due_at", now)
        .order("due_at")
        .limit(50);
      if (cancelled) return;
      const list = (rows ?? []) as SrsRow[];

      const vocabIds = [...new Set(list.filter((r) => r.item_type === "vocab").map((r) => r.item_id))];
      let vmap = new Map<string, VocabRow>();
      if (vocabIds.length) {
        const { data: vocabRows } = await sb
          .from("vocab")
          .select("id,kana,kanji,romaji,meaning_vi,example_jp,example_reading,example_vi")
          .in("id", vocabIds);
        vmap = new Map((vocabRows ?? []).map((v) => [v.id, v as VocabRow]));
      }
      setVocabMap(vmap);

      const kanjiIds = [...new Set(list.filter((r) => r.item_type === "kanji").map((r) => r.item_id))];
      let kmap = new Map<string, KanjiRow>();
      if (kanjiIds.length) {
        const { data: kanjiRows } = await sb
          .from("kanji")
          .select("id,char,meaning_vi,on_reading,kun_reading,stroke_count")
          .in("id", kanjiIds);
        kmap = new Map((kanjiRows ?? []).map((k) => [k.id, k as KanjiRow]));
      }
      setKanjiMap(kmap);

      if (list.length === 0) {
        const { data: soon } = await sb
          .from("srs_cards")
          .select("due_at")
          .eq("user_id", userId)
          .gt("due_at", now)
          .order("due_at")
          .limit(1);
        if (soon?.length) setNextDue(soon[0].due_at);
      }
      setCards(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const total = cards?.length ?? 0;
  const card = cards?.[index];
  const kanaItem = card?.item_type === "kana" ? kanaByChar.get(card.item_id) : undefined;
  const vocabItem = card?.item_type === "vocab" ? vocabMap.get(card.item_id) : undefined;

  const grade = useCallback(
    async (g: Grade) => {
      if (!card) return;
      if (g === "good" || g === "easy") correctRef.current += 1;
      const result = review(
        {
          ease: card.ease,
          intervalDays: card.interval_days,
          repetitions: card.repetitions,
          lapses: card.lapses,
        },
        g,
      );
      const sb = createClient();
      await sb
        .from("srs_cards")
        .update({
          ease: result.ease,
          interval_days: result.intervalDays,
          repetitions: result.repetitions,
          lapses: result.lapses,
          due_at: dueAt(new Date(), result).toISOString(),
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", card.id);
      setRevealed(false);

      // Buổi ôn kết thúc: báo server cộng XP (server tự tính lại).
      if (index + 1 >= total) {
        void recordStudyEvent({ kind: "review", correct: correctRef.current, total })
          .then(setXpResult)
          .catch(() => {});
      }
      setIndex((i) => i + 1);
    },
    [card, index, total],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!card) return;
      if (e.key === " " && !revealed) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed) {
        const map: Record<string, Grade> = { "1": "again", "2": "hard", "3": "good", "4": "easy" };
        const g = map[e.key];
        if (g) {
          e.preventDefault();
          void grade(g);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, grade]);

  const done = cards !== null && index >= total;

  if (cards === null) {
    return (
      <div aria-hidden className="mx-auto h-72 w-full max-w-md animate-pulse rounded-3xl bg-surface-2" />
    );
  }

  if (done) {
    const when = nextDue
      ? new Date(nextDue).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "numeric",
        })
      : null;
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16 text-center">
        <p className="text-5xl font-bold text-mint">Đã ôn hết!</p>
        {xpResult?.ok && (
          <motion.p
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="mt-3 rounded-full bg-butter-soft px-4 py-1.5 text-sm font-bold text-butter"
          >
            +{xpResult.xpGained} XP
          </motion.p>
        )}
        {xpResult?.levelUp && (
          <p className="mt-2 rounded-2xl bg-mint-soft px-4 py-2 text-sm font-bold text-mint">
            Lên cấp {xpResult.newLevel}!
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          {total === 0
            ? "Hôm nay chưa có thẻ nào đến hạn. Học bài mới hoặc chơi game để thêm thẻ nhé."
            : "Kotori sẽ nhắc bạn ôn tiếp đúng lúc trí nhớ bắt đầu mờ đi."}
        </p>
        {when && <p className="mt-1 text-sm text-muted">Lần ôn kế tiếp: {when}</p>}
        <Button variant="soft" size="lg" className="mt-8" onClick={() => window.location.assign("/hoc")}>
          Về trang học
        </Button>
      </div>
    );
  }

  const prompt =
    card?.item_type === "kana"
      ? "Đọc thế nào?"
      : card?.item_type === "kanji"
        ? "Kanji này nghĩa là gì?"
        : "Từ này nghĩa là gì?";
  const speakText =
    card?.item_type === "kana" ? card.item_id : vocabItem?.kana ?? card?.item_id ?? "";

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">Ôn tập</p>
        <p className="text-sm text-muted">
          {index + 1}/{total}
        </p>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      <motion.div
        key={card?.id}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-surface p-8 text-center shadow-soft"
      >
        {card?.item_type === "kana" ? (
          <p className="font-jp text-7xl font-bold">{card.item_id}</p>
        ) : (
          <>
            <p className="font-jp text-5xl font-bold">{vocabItem?.kana ?? card?.item_id}</p>
            {vocabItem?.kanji && (
              <p className="mt-1 font-jp text-lg text-muted">{vocabItem.kanji}</p>
            )}
          </>
        )}
        <p className="mt-3 text-sm text-muted">{prompt}</p>
        <SpeakButton text={speakText} slow className="mt-4 justify-center" />

        {revealed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t border-border pt-5"
          >
            {card?.item_type === "kana" ? (
              <p className="text-2xl font-bold text-primary-text">{kanaItem?.romaji}</p>
            ) : card?.item_type === "kanji" ? (
              <>
                <p className="text-xl font-bold">{kanjiMap.get(card.item_id)?.meaning_vi}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {(kanjiMap.get(card.item_id)?.on_reading ?? []).map((r) => (
                    <span key={r} className="rounded-full bg-secondary-soft px-2.5 py-0.5 font-jp text-xs text-secondary-text">
                      {r}
                    </span>
                  ))}
                  {(kanjiMap.get(card.item_id)?.kun_reading ?? []).map((r) => (
                    <span key={r} className="rounded-full bg-mint-soft px-2.5 py-0.5 font-jp text-xs text-mint">
                      {r}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">{vocabItem?.romaji}</p>
                <p className="mt-1 text-xl font-bold">{vocabItem?.meaning_vi}</p>
                {vocabItem?.example_jp && (
                  <div className="mt-4 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
                    <p className="font-jp">{vocabItem.example_jp}</p>
                    {vocabItem.example_vi && (
                      <p className="mt-1 text-muted">{vocabItem.example_vi}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </motion.div>

      {!revealed ? (
        <Button size="lg" className="mt-5 w-full" onClick={() => setRevealed(true)}>
          Lật đáp án <span className="text-xs opacity-70">(phím cách)</span>
        </Button>
      ) : (
        <div className="mt-5 grid grid-cols-4 gap-2">
          {grades.map((g, i) => (
            <button
              key={g.key}
              type="button"
              onClick={() => void grade(g.key)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3 font-bold transition-transform hover:scale-[1.03] active:scale-95",
                g.classes,
              )}
            >
              <span>{g.label}</span>
              <span className="text-[10px] font-medium opacity-70">
                {g.hint} · {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
