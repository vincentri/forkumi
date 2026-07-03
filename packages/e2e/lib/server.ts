import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { run } from "./run";
import { REPO_ROOT } from "./paths";

const API_DIR = resolve(REPO_ROOT, "apps", "api");
const NEXT_BIN = resolve(API_DIR, "node_modules", ".bin", "next");

export const BASE_URL = "http://localhost:3001";
const HEALTH_URL = `${BASE_URL}/api/trpc/health`;

export interface ServerEnv {
  DATABASE_URL: string;
  DIRECT_URL: string;
}

/**
 * Build the api (unless E2E_SKIP_BUILD=1) and boot `next start` with the
 * testcontainer DB injected into its env. Prisma reads DATABASE_URL at module
 * init, and Next.js/dotenv skip already-set vars, so this injected value wins
 * over the symlinked .env. Resolves once /api/trpc/health responds 200.
 */
export async function startServer(env: ServerEnv): Promise<ChildProcess> {
  if (process.env.E2E_SKIP_BUILD === "1") {
    console.log("[e2e] E2E_SKIP_BUILD=1 — reusing existing apps/api/.next build");
  } else {
    console.log("[e2e] Building api (next build)...");
    await run("pnpm", ["--filter", "api", "build"], { cwd: REPO_ROOT });
  }

  const serverEnv = {
    ...process.env,
    DATABASE_URL: env.DATABASE_URL,
    DIRECT_URL: env.DIRECT_URL,
    NEXTAUTH_URL: BASE_URL,
    // Never reach S3 during admin render — keep storage local for tests.
    STORAGE_PROVIDER: "local",
    NODE_ENV: "production",
  };

  console.log("[e2e] Starting api server (next start -p 3001)...");
  const child = spawn(NEXT_BIN, ["start", "-p", "3001"], {
    cwd: API_DIR,
    env: serverEnv,
    stdio: "inherit",
  });

  child.on("error", (err) => {
    console.error("[e2e] Server spawn error:", err.message);
  });

  await waitForHealth();
  console.log("[e2e] api server is healthy.");
  return child;
}

async function waitForHealth(timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) return;
      lastError = `status ${res.status}`;
    } catch (err) {
      lastError = (err as Error).message;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`api server did not become healthy within ${timeoutMs}ms (last: ${lastError})`);
}

/** Kill the server process tree. */
export async function stopServer(child: ChildProcess): Promise<void> {
  if (child.killed || child.pid === undefined) return;
  await new Promise<void>((resolve) => {
    child.on("exit", () => resolve());
    // Negative pid would target the group; pnpm spawns children, so SIGTERM the
    // process and rely on Next.js to clean up its own workers.
    child.kill("SIGTERM");
    // Safety net: force-kill if it lingers.
    setTimeout(() => {
      if (!child.killed) child.kill("SIGKILL");
      resolve();
    }, 5000);
  });
}
