import { defineConfig } from "@playwright/test";
import { AUTH_STATE, baseConfig } from "./playwright.base.config";

/**
 * Core e2e config: uses the trimmed e2e schema (packages/e2e/prisma) with
 * only the models that current specs touch (User, Role, UserInvitation,
 * Settings, FrontPageSettings). Faster, smaller testcontainer DB, and
 * intentionally decoupled from the prod migration history.
 *
 * The api server + test database are managed via global-setup.core.ts
 * (testcontainers + migrate + seed + next start), so there is intentionally
 * no `webServer` here: Playwright's static webServer.env can't receive the
 * dynamic container URL.
 *
 * The `logged-in` testMatch excludes `crud-generic` because the trimmed
 * schema does not contain Blog/Tag/Event/Slider/etc. models. Add new
 * patterns here as new core specs land.
 *
 * Use `pnpm e2e:core` (test:e2e:core) to run this config.
 */
export default defineConfig({
  ...baseConfig,
  globalSetup: "./global-setup.core.ts",

  projects: [
    ...baseConfig.projects,
    {
      name: "logged-in",
      testMatch: /(admin-render|role|settings|front-page).*\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...baseConfig.use, storageState: AUTH_STATE },
    },
  ],
});
