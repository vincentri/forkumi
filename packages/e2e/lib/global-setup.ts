import type { FullConfig } from "@playwright/test";
import { startDatabase, migrateAndSeed } from "./db";
import { startServer, stopServer } from "./server";

/**
 * Build a Playwright globalSetup bound to a specific Prisma directory. The
 * two configs (full = apps/api/prisma, core = packages/e2e/prisma) each call
 * this factory with their own path.
 *
 * Each invocation:
 *   1. starts an ephemeral postgres (testcontainers)
 *   2. applies the prisma migrate deploy chain from `prismaDir` against it
 *   3. regenerates the Prisma client from the PROD schema (apps/api) — the
 *      API server's runtime client must never diverge from apps/api imports
 *   4. seeds (admin@example.com / password, super admin + viewer roles,
 *      default branding + front-page settings)
 *   5. builds + boots the api server with the test DB injected
 *
 * Returns a teardown closure (Playwright awaits it after the run), keeping the
 * container + server handles in scope so we can stop them cleanly.
 */
type GlobalSetupFn = (config: FullConfig) => Promise<() => Promise<void>>;

export function makeGlobalSetup(prismaDir: string): GlobalSetupFn {
  const globalSetup: GlobalSetupFn = async (_config: FullConfig) => {
    const { container, databaseUrl } = await startDatabase();
    console.log(`[e2e] Test database ready: ${maskUrl(databaseUrl)}`);

    let server: Awaited<ReturnType<typeof startServer>> | undefined;
    try {
      await migrateAndSeed({ databaseUrl, prismaDir });
      server = await startServer({ DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl });
    } catch (err) {
      if (server) await stopServer(server);
      await container.stop();
      throw err;
    }

    return async () => {
      console.log("[e2e] Tearing down server + database...");
      if (server) await stopServer(server);
      await container.stop();
    };
  };

  return globalSetup;
}

function maskUrl(url: string): string {
  return url.replace(/:\/\/[^@]*@/, "://***@");
}
