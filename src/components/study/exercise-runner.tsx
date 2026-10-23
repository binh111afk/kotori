"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react";
import { checkAnswer } from "@/lib/answer-checker";
import { recordStudyEvent, type StudyEventResult } from "@/app/actions/study";
import { Button, ButtonLink } from "@/components/ui/button";
import { SpeakButton } from "@/components/study/speak-button";
import { cn } from "@/lib/cn";

export type ExerciseData =
  | {
      id: string;
      type: "fill";
      payload: { before: string; after: string; accepted: string[]; full: string; translation: string; hint?: string; speak?: string };
      explanation_vi?: string | null;
      item_ref?: string | null;
    }
  | {
      id: string;
      type: "reorder";
      payload: { tokens: string[]; translation: string };
      explanation_vi?: string | null;
      item_ref?: string | null;
    }
  | {
      id: string;
      type: "conjugate";
      payload: { base: string; task: string; accepted: string[]; hint?: string };
      explanation_vi?: string | null;
      item_ref?: string | null;
    }
  | {
      id: string;
      type: "match";
      payload: { pairs: { jp: string; vi: string; item_ref?: string }[] };
      explanation_vi?: string | null;
      item_ref?: string | null;
    }
  | {
      id: string;
      type: "choice";
      payload: { question: string; speak?: string; options: string[]; answerIndex: number };
      explanation_vi?: string | null;
      item_ref?: string | null;
    };

function shuffle<T>(arr: T[]): T[] {
  // ponytail: Math.random chỉ xáo thứ tự hiển thị — không dùng cho mục đích bảo mật
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ExerciseRunner({
  title,
  exercises,
  kind = "quiz",
  itemType = null,
  onFinish,
  onExit,
  reviewHref = "/on-tap",
}: {
  title: string;
  exercises: ExerciseData[];
  kind?: "quiz" | "review" | "game";
  itemType?: "kana" | "vocab" | "grammar" | "kanji" | null;
  onFinish?: (wrong: { itemType: "vocab"; itemId: string }[]) => void;
  onExit: () => void;
  reviewHref?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState<{ itemType: "vocab"; itemId: string }[]>([]);
  const [answered, setAnswered] = useState<{ correct: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const [xpResult, setXpResult] = useState<StudyEventResult | null>(null);

  const ex = exercises[index];
  const isLast = index === exercises.length - 1;

  function handleResult(correct: boolean, itemRefs: string[] = []) {
    setAnswered({ correct });
    if (correct) {
      setCorrect((c) => c + 1);
    } else {
      const refs = itemRefs.length ? itemRefs : ex?.item_ref ? [ex.item_ref] : [];
      setWrong((w) => [...w, ...refs.map((itemId) => ({ itemType: "vocab" as const, itemId }))]);
    }
  }

  function next() {
    if (isLast) {
      setDone(true);
      onFinish?.(wrong);
      // XP tính phía server — client chỉ báo correct/total.
      void recordStudyEvent({ kind, itemType, correct, total: exercises.length })
        .then(setXpResult)
        .catch(() => {});
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(null);
  }

  if (done) {
    const score = exercises.length ? Math.round((correct / exercises.length) * 100) : 100;
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center">
        <motion.div
          initial={reduce ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <p className="text-6xl font-bold text-primary-text">{score}%</p>
          <p className="mt-2 font-semibold">
            Đúng {correct}/{exercises.length} câu
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
              Lên cấp {xpResult.newLevel}! Giỏi lắm!
            </p>
          )}
        </motion.div>
        <p className="mt-3 text-sm text-muted">
          {wrong.length === 0
            ? "Xuất sắc! Không sót câu nào cả."
            : `${wrong.length} câu sai đã vào hàng ôn tập — Kotori sẽ nhắc bạn trước khi quên.`}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {wrong.length > 0 && (
            <ButtonLink href={reviewHref} size="lg">
              Ôn lại từ vừa sai
            </ButtonLink>
          )}
          <Button variant="soft" size="lg" onClick={onExit}>
            Về bài học
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-muted">{title}</p>
        <p className="text-sm text-muted">
          {index + 1}/{exercises.length}
        </p>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${((index + (answered ? 1 : 0)) / exercises.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={ex.id}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {ex.type === "fill" && <FillExercise ex={ex} onResult={handleResult} answered={answered !== null} />}
          {ex.type === "conjugate" && <ConjugateExercise ex={ex} onResult={handleResult} answered={answered !== null} />}
          {ex.type === "reorder" && <ReorderExercise ex={ex} onResult={handleResult} answered={answered !== null} />}
          {ex.type === "choice" && <ChoiceExercise ex={ex} onResult={handleResult} answered={answered !== null} />}
          {ex.type === "match" && <MatchExercise ex={ex} onResult={handleResult} />}

          <AnimatePresence>
            {answered && (
              <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                {!answered.correct && ex.explanation_vi && (
                  <p className="mb-4 rounded-2xl bg-secondary-soft px-4 py-3 text-sm text-secondary-text">
                    {ex.explanation_vi}
                  </p>
                )}
                <Button size="lg" className="w-full" onClick={next}>
                  {isLast ? "Xem kết quả" : "Câu tiếp theo"}
                  <ArrowRight size={18} weight="duotone" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FeedbackLine({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mt-4 rounded-2xl px-4 py-3 text-sm", ok ? "bg-mint-soft text-mint" : "bg-danger-soft text-danger-text")}
    >
      {children}
    </motion.p>
  );
}

function FillExercise({
  ex,
  onResult,
  answered,
}: {
  ex: Extract<ExerciseData, { type: "fill" }>;
  onResult: (ok: boolean) => void;
  answered: boolean;
}) {
  const [value, setValue] = useState("");
  const [ok, setOk] = useState(false);
  const p = ex.payload;

  function check() {
    const result = checkAnswer(value, p.accepted);
    setOk(result);
    onResult(result);
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Điền vào chỗ trống</p>
      <p className="mt-4 font-jp text-2xl leading-relaxed">
        {p.before}
        <span className="mx-1 inline-block min-w-16 rounded-xl border-b-2 border-primary bg-primary-soft/60 px-3 text-center align-bottom">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !answered && check()}
            disabled={answered}
            aria-label="Điền đáp án"
            className="w-full min-w-16 bg-transparent text-center font-jp text-2xl outline-none placeholder:text-muted/50"
            placeholder="？"
          />
        </span>
        {p.after}
      </p>
      {p.speak && <SpeakButton text={p.speak} slow className="mt-3" />}
      {!answered && (
        <Button className="mt-5 w-full" size="lg" onClick={check} disabled={!value.trim()}>
          Kiểm tra
        </Button>
      )}
      {answered && (
        <FeedbackLine ok={ok}>
          {ok ? "Chính xác! " : "Chưa đúng. "}
          Đáp án: <span className="font-jp">{p.full}</span> — {p.translation}
        </FeedbackLine>
      )}
    </div>
  );
}

function ConjugateExercise({
  ex,
  onResult,
  answered,
}: {
  ex: Extract<ExerciseData, { type: "conjugate" }>;
  onResult: (ok: boolean) => void;
  answered: boolean;
}) {
  const [value, setValue] = useState("");
  const [ok, setOk] = useState(false);
  const p = ex.payload;

  function check() {
    const result = checkAnswer(value, p.accepted);
    setOk(result);
    onResult(result);
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Chia dạng đúng</p>
      <p className="mt-4 font-jp text-2xl font-bold">{p.base}</p>
      <p className="mt-1 text-sm text-muted">{p.task}</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !answered && check()}
        disabled={answered}
        aria-label="Nhập dạng đúng"
        placeholder={p.hint ?? "Nhập câu trả lời…"}
        className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 font-jp text-lg outline-none focus:border-primary disabled:opacity-60"
      />
      {!answered && (
        <Button className="mt-4 w-full" size="lg" onClick={check} disabled={!value.trim()}>
          Kiểm tra
        </Button>
      )}
      {answered && (
        <FeedbackLine ok={ok}>
          {ok ? "Chính xác! " : "Chưa đúng. "}
          Đáp án: <span className="font-jp">{p.accepted[0]}</span>
        </FeedbackLine>
      )}
    </div>
  );
}

function ReorderExercise({
  ex,
  onResult,
  answered,
}: {
  ex: Extract<ExerciseData, { type: "reorder" }>;
  onResult: (ok: boolean) => void;
  answered: boolean;
}) {
  const pool = useMemo(() => shuffle(ex.payload.tokens), [ex.id]);
  const [picked, setPicked] = useState<number[]>([]);
  const [ok, setOk] = useState(false);
  const p = ex.payload;

  function check() {
    const result = picked.length === p.tokens.length && picked.every((pi, i) => p.tokens[pi] === p.tokens[i]);
    setOk(result);
    onResult(result);
  }
  function reset() {
    setPicked([]);
  }

  const built = picked.map((pi) => p.tokens[pi]).join("");
  const correctText = p.tokens.join("");

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Sắp xếp thành câu</p>
      <p className="mt-2 text-sm text-muted">Nghĩa: {p.translation}</p>

      <div className="mt-4 flex min-h-14 flex-wrap items-center gap-1.5 rounded-2xl border border-dashed border-border bg-background p-3">
        {picked.length === 0 && <span className="text-sm text-muted/60">Bấm các thẻ bên dưới theo đúng thứ tự…</span>}
        {picked.map((pi, i) => (
          <button
            key={`${pi}-${i}`}
            type="button"
            disabled={answered}
            onClick={() => setPicked((ps) => ps.filter((_, j) => j !== i))}
            className="rounded-xl bg-primary-soft px-3 py-1.5 font-jp text-lg"
          >
            {p.tokens[pi]}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {pool.map((t, i) => (
          <button
            key={`${t}-${i}`}
            type="button"
            disabled={answered || picked.includes(i)}
            onClick={() => setPicked((ps) => [...ps, i])}
            className={cn(
              "rounded-xl border border-border bg-surface px-3 py-1.5 font-jp text-lg transition-opacity",
              picked.includes(i) && "opacity-30",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {!answered ? (
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" onClick={reset} disabled={picked.length === 0}>
            Làm lại
          </Button>
          <Button className="flex-1" size="lg" onClick={check} disabled={picked.length !== p.tokens.length}>
            Kiểm tra
          </Button>
        </div>
      ) : (
        <FeedbackLine ok={ok}>
          {ok ? "Chính xác! " : "Chưa đúng. "}
          Câu đúng: <span className="font-jp">{correctText}</span>
        </FeedbackLine>
      )}
    </div>
  );
}

function ChoiceExercise({
  ex,
  onResult,
  answered,
}: {
  ex: Extract<ExerciseData, { type: "choice" }>;
  onResult: (ok: boolean) => void;
  answered: boolean;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const p = ex.payload;

  function choose(i: number) {
    if (answered) return;
    setChosen(i);
    onResult(i === p.answerIndex);
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Chọn đáp án</p>
      <p className="mt-3 font-jp text-xl leading-relaxed">{p.question}</p>
      {p.speak && <SpeakButton text={p.speak} className="mt-3" />}
      <div className="mt-4 grid gap-2.5">
        {p.options.map((opt, i) => {
          const isAnswer = i === p.answerIndex;
          const isChosen = i === chosen;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left font-semibold transition-colors",
                answered && isAnswer
                  ? "border-mint-vivid bg-mint-soft text-mint"
                  : answered && isChosen
                    ? "border-danger bg-danger-soft text-danger-text"
                    : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span className="font-jp">{opt}</span>
              {answered && isAnswer && <CheckCircle size={18} weight="duotone" className="shrink-0" />}
              {answered && isChosen && !isAnswer && <XCircle size={18} weight="duotone" className="shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchExercise({
  ex,
  onResult,
}: {
  ex: Extract<ExerciseData, { type: "match" }>;
  onResult: (ok: boolean, itemRefs: string[]) => void;
}) {
  const p = ex.payload;
  const left = useMemo(() => shuffle(p.pairs.map((_, i) => i)), [ex.id]);
  const right = useMemo(() => shuffle(p.pairs.map((_, i) => i)), [ex.id]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const complete = matched.length === p.pairs.length;

  function pickLeft(i: number) {
    if (matched.includes(i)) return;
    setSelectedLeft(i);
  }
  function pickRight(j: number) {
    if (matched.includes(j) || selectedLeft === null) return;
    if (selectedLeft === j) {
      setMatched((m) => [...m, j]);
    } else {
      setMistakes((n) => n + 1);
      setShake(j);
      setTimeout(() => setShake(null), 450);
    }
    setSelectedLeft(null);
    if (matched.length + (selectedLeft === j ? 1 : 0) === p.pairs.length) {
      onResult(mistakes === 0, p.pairs.map((pr) => pr.item_ref).filter((r): r is string => !!r));
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Nối cặp</p>
      <p className="mt-2 text-sm text-muted">Bấm cột tiếng Nhật rồi chọn nghĩa đúng bên kia.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {left.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => pickLeft(i)}
              disabled={matched.includes(i)}
              className={cn(
                "rounded-2xl border px-3 py-3 font-jp text-base transition-colors",
                matched.includes(i)
                  ? "border-mint-vivid bg-mint-soft text-mint opacity-70"
                  : selectedLeft === i
                    ? "border-primary bg-primary-soft text-primary-text"
                    : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              {p.pairs[i].jp}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {right.map((j) => (
            <motion.button
              key={j}
              type="button"
              onClick={() => pickRight(j)}
              disabled={matched.includes(j)}
              animate={shake === j ? { x: [0, -7, 7, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left text-sm transition-colors",
                matched.includes(j)
                  ? "border-mint-vivid bg-mint-soft text-mint opacity-70"
                  : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              {p.pairs[j].vi}
            </motion.button>
          ))}
        </div>
      </div>
      {mistakes > 0 && !complete && (
        <p className="mt-3 text-xs text-muted">Số lần nối sai: {mistakes}</p>
      )}
      {complete && (
        <FeedbackLine ok={mistakes === 0}>
          {mistakes === 0 ? "Nối chuẩn không sai cặp nào!" : `Hoàn thành với ${mistakes} lần nối sai — các cặp này sẽ quay lại trong ôn tập.`}
        </FeedbackLine>
      )}
    </div>
  );
}
