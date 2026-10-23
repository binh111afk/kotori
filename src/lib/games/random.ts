// Tiện ích xáo trộn dùng chung cho game và bài luyện.
// ponytail: Math.random chỉ xáo thứ tự chơi — không dùng cho mục đích bảo mật

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
