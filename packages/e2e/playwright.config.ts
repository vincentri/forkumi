import { defineConfig } from "@playwright/test";
import { AUTH_STATE, baseConfig } from "./playwright.base.config";

/**
 * Full e2e config: uses the prod Prisma migration chain (apps/api/prisma).
 * The api server + test database are managed via global-setup.full.ts
 * (testcontainers + migrate + seed + next start), so there is intentionally
 * no `webServer` here: Playwright's static webServer.env can't receive the
 * dynamic container URL.
 *
 * Use `pnpm e2e` (test:e2e:full) to run this config.
 */
export default defineConfig({
  ...baseConfig,
  globalSetup: "./global-setup.full.ts",

  projects: [
    ...baseConfig.projects,
    {
      name: "logged-in",
      testMatch: /(admin-render|role|crud-generic|settings|front-page).*\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...baseConfig.use, storageState: AUTH_STATE },
    },
  ],
});
