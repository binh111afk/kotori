import { expect, test } from "@playwright/test";

const uniqueEmail = () => `pw-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;

test("đăng ký → dashboard → học → luyện → XP và streak xuất hiện", async ({ page }) => {
  const email = uniqueEmail();

  // Đăng ký
  await page.goto("/dang-ky");
  await page.getByLabel("Tên hiển thị").fill("Người thử Playwright");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill("pw-test-123");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.waitForURL("**/hoc", { timeout: 20_000 });

  // Dashboard: mục tiêu + kana units + kanji card
  await expect(page.getByText("Mục tiêu hôm nay")).toBeVisible();
  await expect(page.getByText("Kanji N5 — 100 chữ")).toBeVisible();

  // Mở unit U1 → tab Luyện
  await page.goto("/hoc/u1");
  await expect(page.getByRole("heading", { name: "Chào hỏi & tự giới thiệu" })).toBeVisible();
  await page.getByRole("button", { name: "Luyện" }).click();
  await expect(page.getByText(/^1\/\d+$/)).toBeVisible({ timeout: 15_000 });

  // Trả lời câu đầu: bấm lựa chọn đầu tiên rồi sang câu tiếp
  await page.locator("main button:has(span.font-jp)").first().click();
  await page.getByRole("button", { name: /Câu tiếp theo|Xem kết quả/ }).click();
  await expect(page.getByText(/^2\/\d+$/)).toBeVisible({ timeout: 15_000 });

  // Trang thống kê có cấp độ + streak
  await page.goto("/thong-ke");
  await expect(page.getByText(/Cấp \d+ · \d+ XP/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("ngày liền").first()).toBeVisible();
});

test("trang học chặn người chưa đăng nhập", async ({ page }) => {
  await page.goto("/hoc");
  await page.waitForURL("**/dang-nhap", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Chào bạn trở lại!" })).toBeVisible();
});
