import { API_PRISMA_DIR } from "./lib/paths";
import { makeGlobalSetup } from "./lib/global-setup";

/**
 * Full e2e global-setup: uses the prod Prisma migration chain
 * (apps/api/prisma). Used by pnpm e2e / playwright.config.ts.
 */
export default makeGlobalSetup(API_PRISMA_DIR);
