import { readFileSync } from "fs";
import { join } from "path";
import type { NextConfig } from "next";

const monorepoRoot = join(__dirname, "../..");

// Next.js only reads .env from its own app directory.
// In this monorepo, .env lives at the root — load it manually here.
// Does not override vars already set (so production platform vars win).
try {
  const lines = readFileSync(join(monorepoRoot, ".env"), "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
  if (!process.env.DATABASE_URL && process.env.POSTGRES_USER) {
    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB } = process.env;
    process.env.DATABASE_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
  }
} catch { /* .env not present — env vars provided externally (production) */ }

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@repo/ui", "@repo/crud", "@repo/auth", "@repo/db", "@repo/admin"],
};

export default nextConfig;
