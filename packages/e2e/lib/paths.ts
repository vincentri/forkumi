import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Locate the monorepo root by walking up from the current directory until a
 * pnpm-workspace.yaml is found. Avoids import.meta (Playwright loads these
 * files through its CommonJS TS loader, where import.meta is unavailable).
 */
function findRepoRoot(): string {
  let dir = process.cwd();
  while (true) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error("Could not locate repo root (no pnpm-workspace.yaml found walking up)");
    }
    dir = parent;
  }
}

export const REPO_ROOT = findRepoRoot();
export const API_PRISMA_DIR = resolve(REPO_ROOT, "apps", "api", "prisma");
export const E2E_PRISMA_DIR = resolve(REPO_ROOT, "packages", "e2e", "prisma");
export const SEED_SCRIPT = resolve(REPO_ROOT, "packages", "db", "src", "seed.ts");
/** prisma binary lives in @repo/db (the only package that depends on prisma). */
export const PRISMA_BIN = resolve(REPO_ROOT, "packages", "db", "node_modules", ".bin", "prisma");
