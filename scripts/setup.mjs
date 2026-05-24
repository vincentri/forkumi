#!/usr/bin/env node
/**
 * node scripts/setup.mjs
 *
 * Copies .env.example → .env and injects a fresh NEXTAUTH_SECRET.
 * Safe to re-run — skips if .env already exists.
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envExample = resolve(root, ".env.example");
const envFile = resolve(root, ".env");

// --- Already exists ---
if (existsSync(envFile)) {
  console.log(".env already exists — skipping. Delete it and re-run to reset.");
  process.exit(0);
}

// --- Read template ---
if (!existsSync(envExample)) {
  console.error("Error: .env.example not found. Are you in the right directory?");
  process.exit(1);
}

const template = readFileSync(envExample, "utf-8");

// --- Inject generated secret ---
const secret = randomBytes(32).toString("base64");
const env = template.replace(
  /^NEXTAUTH_SECRET=.*$/m,
  `NEXTAUTH_SECRET="${secret}"`,
);

writeFileSync(envFile, env, "utf-8");
console.log("✓  Created .env with a generated NEXTAUTH_SECRET");
console.log("");
console.log("Next steps:");
console.log("  1. Edit .env — set POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB if needed");
console.log("     Defaults: postgres / postgres / quantyx @ localhost:5432");
console.log("");
console.log("  2. Start Postgres (if using Docker):");
console.log("     docker compose up -d");
console.log("");
console.log("  3. Install, push schema, seed:");
console.log("     pnpm install && pnpm db:push && pnpm db:seed");
console.log("");
console.log("  4. Run:");
console.log("     pnpm dev");
console.log("");
console.log("  Admin panel: http://localhost:3001/admin");
console.log("  Login:       admin@example.com / password");
console.log("");

// --- Docker advisory check ---
try {
  execSync("docker info", { stdio: "ignore" });
  console.log("✓  Docker is running");
} catch {
  console.log("⚠  Docker is not running. Start it before running 'docker compose up -d'.");
}
