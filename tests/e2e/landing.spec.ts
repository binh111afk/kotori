import { expect, test } from "@playwright/test";

test("landing hiển thị hero và CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Kotori/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Học tiếng Nhật");
  await expect(page.getByRole("link", { name: "Học miễn phí ngay" })).toBeVisible();
});

test("trang nguồn dữ liệu liệt kê JMdict, KanjiVG, Tatoeba", async ({ page }) => {
  await page.goto("/nguon");
  await expect(page.getByRole("heading", { name: "JMdict / EDICT" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "KanjiVG" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tatoeba" })).toBeVisible();
});
