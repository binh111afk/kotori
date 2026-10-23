import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nguồn dữ liệu & giấy phép" };

const sources = [
  {
    name: "JMdict / EDICT",
    what: "Từ điển Nhật–Anh: từ vựng, cách đọc kana, cách viết kanji, từ loại. Nghĩa tiếng Việt do Kotori tự dịch từ gloss tiếng Anh và đối chiếu thêm.",
    license: "CC BY-SA 4.0",
    holder: "Electronic Dictionary Research and Development Group (EDRDG)",
    link: "https://www.edrdg.org/edrdg/licence",
  },
  {
    name: "KANJIDIC2",
    what: "Thông tin kanji: âm on/kun, nghĩa tiếng Anh, số nét, cấp học.",
    license: "CC BY-SA 4.0",
    holder: "EDRDG",
    link: "https://www.edrdg.org/edrdg/licence",
  },
  {
    name: "KanjiVG",
    what: "Thứ tự và hình dạng nét viết kanji/kana dạng SVG dùng cho hoạt hình nét chữ.",
    license: "CC BY-SA 3.0",
    holder: "Ulrich Apel & KanjiVG project",
    link: "https://kanjivg.tagaini.net",
  },
  {
    name: "Tatoeba",
    what: "Câu ví dụ tiếng Nhật kèm bản dịch (có tiếng Việt).",
    license: "CC BY 2.0 FR",
    holder: "Tatoeba Project",
    link: "https://tatoeba.org/en/terms_of_use",
  },
  {
    name: "Danh sách từ vựng theo cấp JLPT",
    what: "Tổng hợp từ các nguồn cộng đồng (nổi bật: jlptstudy.net, dựa trên đề thi thật trước 2010). JLPT không công bố danh sách chính thức — mọi con số trong app là ước lượng.",
    license: "Sử dụng như nguồn tham chiếu cộng đồng",
    holder: "jlptstudy.net & cộng đồng",
    link: "https://www.jlptstudy.net/N5",
  },
];

export default function SourcesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Nguồn dữ liệu &amp; giấy phép
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Nội dung tiếng Nhật của Kotori xây trên dữ liệu mở, hợp pháp và có ghi nguồn.
        Mỗi mục nội dung trong app đều mang tham chiếu nguồn và trạng thái kiểm chứng
        riêng. Dữ liệu phái sinh từ các nguồn ShareAlike được phân phối theo đúng giấy
        phép gốc tương ứng.
      </p>

      <div className="mt-8 space-y-4">
        {sources.map((s) => (
          <section
            key={s.name}
            className="rounded-3xl border border-border bg-surface p-6 shadow-soft"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">{s.name}</h2>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-text">
                {s.license}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.what}</p>
            <p className="mt-2 text-sm">
              © {s.holder} ·{" "}
              <a
                href={s.link}
                target="_blank"
                rel="noreferrer noopener"
                className="font-semibold text-primary-text underline decoration-dotted underline-offset-4"
              >
                Xem giấy phép
              </a>
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
