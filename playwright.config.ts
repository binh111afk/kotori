import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
    locale: "vi-VN",
  },
  webServer: {
    command: "npx next start -p 3100",
    port: 3100,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
