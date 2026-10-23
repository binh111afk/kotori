import { FadeIn } from "@/components/motion/fade-in";
import { ButtonLink } from "@/components/ui/button";
import { Hero } from "@/components/landing/hero";
import {
  BookOpen,
  Cards,
  Ear,
  FireSimple,
  GraduationCap,
  Headphones,
  Joystick,
  Medal,
  PencilSimpleLine,
  Repeat,
} from "@phosphor-icons/react/dist/ssr";

const steps = [
  {
    icon: BookOpen,
    title: "Học mới",
    desc: "Flashcard có furigana, romaji và câu ví dụ — nghe được ngay.",
    tint: "bg-primary-soft text-primary-text",
  },
  {
    icon: PencilSimpleLine,
    title: "Luyện",
    desc: "Điền từ, sắp xếp câu, nối cặp… sai ở đâu được giải thích ngay ở đó.",
    tint: "bg-secondary-soft text-secondary-text",
  },
  {
    icon: Repeat,
    title: "Ôn đúng lúc",
    desc: "Ôn tập ngắt quãng (SRS): nhắc bạn trước lúc sắp quên, không ôn dồn.",
    tint: "bg-mint-soft text-mint",
  },
  {
    icon: Joystick,
    title: "Chơi",
    desc: "Mini game từ vựng — từ nào sai sẽ tự lọt vào hàng ôn của hôm sau.",
    tint: "bg-butter-soft text-butter",
  },
];

const stats = [
  { value: "800+", label: "từ vựng N5" },
  { value: "103", label: "kanji N5" },
  { value: "80", label: "điểm ngữ pháp N5" },
  { value: "46+46", label: "hiragana & katakana" },
];

const features = [
  {
    icon: Cards,
    title: "Flashcard thông minh",
    desc: "Lật thẻ 3D, phát âm chuẩn giọng Nhật, lọc theo chủ đề và cấp độ.",
  },
  {
    icon: Ear,
    title: "Luyện nghe theo lộ trình",
    desc: "Mẹo nghe → nghe chậm/thường → bài tập → transcript đầy đủ furigana.",
  },
  {
    icon: GraduationCap,
    title: "Ngữ pháp cho người Việt",
    desc: "Chỉ ra đúng những lỗi người Việt hay mắc, ví dụ dịch chi tiết.",
  },
  {
    icon: FireSimple,
    title: "Streak & động lực",
    desc: "Chuỗi ngày học liên tục có đóng băng, XP, huy hiệu — nhẹ nhàng không ép.",
  },
  {
    icon: Medal,
    title: "Game học từ",
    desc: "Nối cặp, lật thẻ, gõ nhanh, quiz tốc độ — chơi xong vẫn thuộc bài.",
  },
  {
    icon: Headphones,
    title: "Nghe mọi nơi",
    desc: "Tối ưu cho điện thoại, phát âm hoạt động ngay trên trình duyệt.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* Vòng lặp học */}
      <section id="cach-hoc" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <FadeIn>
          <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            Một vòng học nhỏ, đủ cả bốn bước
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Kotori ghép bốn phương pháp đã được nghiên cứu: chủ động gợi nhớ, ôn
            ngắt quãng, luyện xen kẽ và đầu vào vừa sức (i+1).
          </p>
        </FadeIn>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08}>
              <li className="relative h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <span
                  className={`mb-4 inline-grid size-11 place-items-center rounded-2xl ${s.tint}`}
                >
                  <s.icon size={22} weight="duotone" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Bước {i + 1}
                </p>
                <h3 className="mt-0.5 font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.desc}</p>
              </li>
            </FadeIn>
          ))}
        </ol>

        <FadeIn delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-3xl bg-surface px-6 py-6 text-center shadow-soft">
            {stats.map((st) => (
              <div key={st.label}>
                <p className="text-2xl font-bold text-primary-text">{st.value}</p>
                <p className="text-xs font-medium text-muted">{st.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Số liệu N5 là ước lượng theo nguồn cộng đồng — JLPT không công bố danh sách chính thức.
          </p>
        </FadeIn>
      </section>

      {/* Tính năng */}
      <section className="border-y border-border bg-surface-2/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <FadeIn>
            <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
              Mọi thứ bạn cần, không thừa thứ gì
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-3xl border border-border bg-surface p-6 shadow-soft">
                  <span className="mb-4 inline-grid size-11 place-items-center rounded-2xl bg-surface-2 text-primary-text">
                    <f.icon size={22} weight="duotone" />
                  </span>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-butter-soft px-6 py-12 text-center sm:px-12">
            <p aria-hidden className="absolute left-8 top-6 font-jp text-2xl font-bold text-butter/70">
              毎日すこしずつ
            </p>
            <p aria-hidden className="absolute bottom-6 right-8 font-jp text-2xl font-bold text-butter/70">
              毎日すこしずつ
            </p>
            <h2 className="mx-auto max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
              Mỗi ngày một chút, tiến bộ mỗi ngày
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              毎日すこしずつ — “mỗi ngày một chút”. Đó là cả triết lý của Kotori.
            </p>
            <ButtonLink href="/dang-ky" size="lg" className="mt-6">
              Tạo tài khoản miễn phí
            </ButtonLink>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
