import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { resolve } from "node:path";
import { run } from "./run";
import { PRISMA_BIN, REPO_ROOT, SEED_SCRIPT } from "./paths";

/**
 * Spin up an ephemeral postgres so tests never touch the real (Jajanpedia) DB.
 * Requires Docker to be running locally.
 */
export async function startDatabase(): Promise<{
  container: StartedPostgreSqlContainer;
  databaseUrl: string;
}> {
  let container: StartedPostgreSqlContainer;
  try {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
  } catch (err) {
    throw new Error(
      "Failed to start the postgres testcontainer. Is Docker running?\n" +
        `Underlying error: ${(err as Error).message}`,
    );
  }
  return { container, databaseUrl: container.getConnectionUri() };
}

export interface MigrateAndSeedOpts {
  databaseUrl: string;
  /** Prisma directory whose `migrate deploy` chain to apply. */
  prismaDir: string;
}

/**
 * Apply every migration from zero against the fresh DB, then seed. Running
 * `migrate deploy` (not `dev`) validates the committed migration files apply
 * cleanly on an empty database — the "db creation migration" assertion.
 *
 * `prismaDir` selects which migration chain to apply:
 *   - apps/api/prisma  → full prod history (used by `pnpm e2e`)
 *   - packages/e2e/prisma → trimmed e2e schema + generated baseline (used by `pnpm e2e:core`)
 */
export async function migrateAndSeed(opts: MigrateAndSeedOpts): Promise<void> {
  const env = { DATABASE_URL: opts.databaseUrl, DIRECT_URL: opts.databaseUrl };

  console.log(`[e2e] Applying migrations from ${opts.prismaDir}...`);
  await run(PRISMA_BIN, ["migrate", "deploy"], { cwd: opts.prismaDir, env });

  // prisma generate MUST point at the prod schema — the API server's runtime
  // client (@prisma/client, consumed via packages/db) must match what
  // apps/api imports. Pointing this at the e2e schema would silently desync
  // the API from its own client types.
  console.log("[e2e] Generating Prisma client (from prod schema)...");
  await run(
    "pnpm",
    ["exec", "prisma", "generate", "--schema", "../../apps/api/prisma/schema.prisma"],
    { cwd: resolve(REPO_ROOT, "packages", "db"), env },
  );

  console.log("[e2e] Seeding database...");
  await run("pnpm", ["exec", "tsx", SEED_SCRIPT], {
    cwd: resolve(REPO_ROOT, "packages", "db"),
    env,
  });
}
