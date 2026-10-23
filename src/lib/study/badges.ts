// Huy hiệu tính từ thống kê (không lưu DB — tránh đồng bộ hai nơi).
import { levelProgress } from "@/lib/study/level";

export interface StudyStats {
  xp: number;
  streak: number;
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  reviewCardsDone: number;
  perfectSession: boolean; // có buổi ≥10 câu đúng trọn vẹn
  todayXp: number;
  dailyGoal: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  /** Trả về tiến độ hiện tại / mục tiêu. */
  progress: (s: StudyStats) => { current: number; target: number };
}

export const badges: BadgeDef[] = [
  {
    id: "first-steps",
    name: "Khởi động",
    description: "Hoàn thành buổi học đầu tiên",
    progress: (s) => ({ current: Math.min(s.totalSessions, 1), target: 1 }),
  },
  {
    id: "streak-3",
    name: "3 ngày liền",
    description: "Học đều 3 ngày liên tục",
    progress: (s) => ({ current: Math.min(s.streak, 3), target: 3 }),
  },
  {
    id: "streak-7",
    name: "Bền bỉ một tuần",
    description: "Streak chạm mốc 7 ngày",
    progress: (s) => ({ current: Math.min(s.streak, 7), target: 7 }),
  },
  {
    id: "xp-100",
    name: "Trăm điểm đầu",
    description: "Săn được 100 XP",
    progress: (s) => ({ current: Math.min(s.xp, 100), target: 100 }),
  },
  {
    id: "xp-500",
    name: "500 XP",
    description: "Săn được 500 XP",
    progress: (s) => ({ current: Math.min(s.xp, 500), target: 500 }),
  },
  {
    id: "reviewer-50",
    name: "Thợ ôn tập",
    description: "Ôn 50 lượt thẻ SRS",
    progress: (s) => ({ current: Math.min(s.reviewCardsDone, 50), target: 50 }),
  },
  {
    id: "perfect",
    name: "Học chắc",
    description: "Một buổi ≥10 câu đúng trọn vẹn",
    progress: (s) => ({ current: s.perfectSession ? 1 : 0, target: 1 }),
  },
  {
    id: "goal-today",
    name: "Đủ bài hôm nay",
    description: "Đạt mục tiêu XP trong ngày",
    progress: (s) => ({ current: Math.min(s.todayXp, s.dailyGoal), target: s.dailyGoal }),
  },
];

export function evaluateBadges(s: StudyStats) {
  return badges.map((b) => {
    const { current, target } = b.progress(s);
    return { ...b, current, target, earned: current >= target };
  });
}

export { levelProgress };
