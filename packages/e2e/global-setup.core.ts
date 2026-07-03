import { E2E_PRISMA_DIR } from "./lib/paths";
import { makeGlobalSetup } from "./lib/global-setup";

/**
 * Core e2e global-setup: uses the trimmed e2e schema
 * (packages/e2e/prisma). Used by pnpm e2e:core / playwright.core.config.ts.
 */
export default makeGlobalSetup(E2E_PRISMA_DIR);
