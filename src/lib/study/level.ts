// Cấp độ & XP: level N cần cộng dồn 50×(N−1)² XP (lv2=50, lv3=200, lv4=450…).

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return 50 * Math.pow(Math.max(1, level) - 1, 2);
}

export interface LevelProgress {
  level: number;
  currentFloor: number;
  nextLevelXp: number;
  /** 0..1 */
  ratio: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const currentFloor = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const ratio = nextLevelXp === currentFloor ? 0 : (xp - currentFloor) / (nextLevelXp - currentFloor);
  return { level, currentFloor, nextLevelXp, ratio: Math.min(1, Math.max(0, ratio)) };
}
