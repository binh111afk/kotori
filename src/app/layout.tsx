import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PwaRegister } from "@/components/pwa-register";

// Font Nhật (Zen Maru Gothic) tải qua CDN Google Fonts với unicode-range:
// trình duyệt chỉ tải đúng các lát chữ dùng tới, nhẹ hơn nhiều so với tự host
// toàn bộ subset japanese qua next/font.
const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kotori — Học tiếng Nhật mỗi ngày",
    template: "%s · Kotori",
  },
  description:
    "Học tiếng Nhật từ số 0 đến JLPT N5: kana, từ vựng, ngữ pháp, luyện nghe — nhớ lâu nhờ ôn tập ngắt quãng, giải thích tiếng Việt dễ hiểu.",
  icons: { icon: "/brand/kotori-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#201726" },
  ],
};

// Chạy trước lần tô màu đầu tiên để không bị chớp nền sáng/tối lúc tải trang.
const themeNoFlashScript = `(function(){try{var t=localStorage.getItem("kotori-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${quicksand.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <PwaRegister />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* Header đọc session (cookies) — bọc Suspense để các trang tĩnh vẫn prerender được */}
        <Suspense
          fallback={<div aria-hidden className="h-16 border-b border-border bg-background" />}
        >
          <SiteHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
