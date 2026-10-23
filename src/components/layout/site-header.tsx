import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/layout/sign-out-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "";
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    displayName = data?.display_name ?? "";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Kotori — về trang chủ">
          <Image
            src="/brand/kotori-icon.png"
            alt=""
            width={36}
            height={36}
            className="rounded-xl"
          />
          <span className="text-lg font-bold tracking-tight text-primary-text">Kotori</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {user && (
            <nav aria-label="Điều hướng chính" className="mr-1 flex items-center gap-0.5 sm:gap-1">
              <Link
                href="/hoc"
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                Học
              </Link>
              <Link
                href="/on-tap"
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                Ôn tập
              </Link>
              <Link
                href="/choi"
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                Chơi
              </Link>
            </nav>
          )}
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/ho-so"
                className="grid size-10 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary-text"
                title={displayName || "Hồ sơ"}
                aria-label="Trang hồ sơ"
              >
                {(displayName || user.email || "?").slice(0, 1).toUpperCase()}
              </Link>
              <span className="hidden sm:block">
                <SignOutButton />
              </span>
            </>
          ) : (
            <>
              <ButtonLink href="/dang-nhap" variant="ghost">
                Đăng nhập
              </ButtonLink>
              <ButtonLink href="/dang-ky" size="md">
                Bắt đầu học
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
