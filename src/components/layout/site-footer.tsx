import Image from "next/image";
import Link from "next/link";

const sources = [
  { name: "JMdict / KANJIDIC2", license: "CC BY-SA 4.0", by: "EDRDG" },
  { name: "KanjiVG", license: "CC BY-SA 3.0", by: "Ulrich Apel" },
  { name: "Tatoeba", license: "CC BY 2.0 FR", by: "Tatoeba Project" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/kotori-icon.png"
            alt=""
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div>
            <p className="font-bold text-primary-text">Kotori</p>
            <p className="text-sm text-muted">
              Học tiếng Nhật cùng chú chim nhỏ — mỗi ngày một chút.
            </p>
          </div>
        </div>

        <div className="text-sm text-muted">
          <p className="mb-1 font-semibold text-foreground">Nguồn dữ liệu mở</p>
          <ul className="space-y-0.5">
            {sources.map((s) => (
              <li key={s.name}>
                {s.name} · © {s.by} · {s.license}
              </li>
            ))}
            <li>
              <Link href="/nguon" className="underline decoration-dotted underline-offset-4 hover:text-primary-text">
                Chi tiết nguồn &amp; giấy phép
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
