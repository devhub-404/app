import { defineConfig, devices } from "@playwright/test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:4322",
    locale: "pt-BR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "APP_ENV=test WEB_URL=http://localhost:4322 SECURE_COOKIES=false HSTS_ENABLED=false LOCAL_EMAIL_OUTBOX_DIR=../../.local/e2e-mailbox pnpm run dev:test",
      cwd: resolve(configDirectory, "../api"),
      url: "http://localhost:3001/api/v1/platform/readiness",
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command:
        "APP_ENV=test API_URL=http://localhost:3001 WEB_URL=http://localhost:4322 pnpm run dev:test",
      cwd: configDirectory,
      url: "http://localhost:4322/",
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
