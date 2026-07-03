import { devices } from "@playwright/test";

/**
 * Shared Playwright settings for both full and core e2e configs.
 * Each config spreads this and overrides only `globalSetup` and
 * `testMatch` for the logged-in project.
 */

export const AUTH_STATE = "./.auth/admin.json";

export const baseConfig = {
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.E2E_NO_REPORT
    ? [["list"]]
    : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "logged-out",
      testMatch: /auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
};
