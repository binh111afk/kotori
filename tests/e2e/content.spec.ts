import { expect, test } from "@playwright/test";

const uniqueEmail = () => `pw-kanji-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;

test.beforeEach(async ({ page }) => {
  // Tạo tài khoản mới qua UI để có phiên đăng nhập
  await page.goto("/dang-ky");
  await page.getByLabel("Tên hiển thị").fill("Kanji Tester");
  await page.getByLabel("Email").fill(uniqueEmail());
  await page.getByLabel("Mật khẩu").fill("pw-test-123");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.waitForURL("**/hoc", { timeout: 20_000 });
});

test("thư viện kanji hiển thị 100 chữ và modal chi tiết", async ({ page }) => {
  await page.goto("/kanji");
  await expect(page.getByText("Kanji N5 — 100 chữ")).toBeVisible();
  // mở modal chữ đầu tiên
  await page.locator("button", { hasText: /nét/ }).first().click();
  await expect(page.getByText(/on \(katakana\) · kun \(hiragana\)/)).toBeVisible();
});

test("bài nghe có mẹo, player và transcript", async ({ page }) => {
  await page.goto("/nghe");
  await expect(page.getByText("Mẹo nghe")).toBeVisible({ timeout: 15_000 });
  await page.goto("/nghe/l1");
  await expect(page.getByText("Mẹo nghe")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /Xem transcript/ }).click();
  await expect(page.getByText("Transcript & bản dịch")).toBeVisible();
  await expect(page.locator("ruby").first()).toBeVisible();
});

test("sảnh game có 4 game", async ({ page }) => {
  await page.goto("/choi");
  await expect(page.getByText("Nối từ")).toBeVisible();
  await expect(page.getByText("Lật thẻ ghi nhớ")).toBeVisible();
  await expect(page.getByText("Gõ nhanh")).toBeVisible();
  await expect(page.getByText("Quiz tốc độ")).toBeVisible();
});
