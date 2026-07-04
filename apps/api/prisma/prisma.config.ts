import { defineConfig } from "prisma/config";

/**
 * Prisma 7 moved the Migrate/introspection datasource URL out of schema.prisma
 * and into this config file. Without it, `prisma migrate deploy` (and `migrate
 * dev` via scaffold / `pnpm db:migrate`) fail with:
 *   "The datasource property `url` is no longer supported in schema files."
 *
 * The runtime client in packages/db uses the pg driver adapter and ignores this
 * file — this URL is only consumed by the Prisma CLI for migrations.
 */
export default defineConfig({
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    // CLI-only (migrate/introspect). Must NOT use the transaction pooler
    // (Supabase :6543) — migrate needs session-level advisory locks it can't
    // do there and hangs forever. Prefer the direct/session connection.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
