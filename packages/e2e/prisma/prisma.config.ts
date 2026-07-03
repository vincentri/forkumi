import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * e2e-only Prisma config. The datasource URL is injected at runtime by the
 * Playwright global-setup from the testcontainer — never points at the real
 * (Jajanpedia) DB. Mirrors apps/api/prisma/prisma.config.ts in shape; differs
 * only in the `schema` and `migrations.path` it points at.
 */
export default defineConfig({
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
