// Furigana chuẩn bằng <ruby>: mỗi đoạn có thể kèm cách đọc hiển thị nhỏ phía trên.
export interface FuriganaSegment {
  t: string;
  r?: string;
}

export function FuriganaText({ segments, className }: { segments: FuriganaSegment[]; className?: string }) {
  return (
    <span className={className}>
      {segments.map((s, i) =>
        s.r ? (
          <ruby key={i}>
            {s.t}
            <rt className="text-[10px] font-medium text-muted">{s.r}</rt>
          </ruby>
        ) : (
          <span key={i}>{s.t}</span>
        ),
      )}
    </span>
  );
}

export function segmentsToPlain(segments: FuriganaSegment[]): string {
  return segments.map((s) => s.t).join("");
}
