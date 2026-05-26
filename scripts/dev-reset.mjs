#!/usr/bin/env node
import { createInterface } from "readline";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

function readRootEnv() {
  const envPath = new URL("../.env", import.meta.url);
  if (!existsSync(envPath)) return {};

  return Object.fromEntries(
    readFileSync(envPath, "utf-8")
      .split("\n")
      .map((line) => line.match(/^([^#\s][^=]*)=(.*)$/))
      .filter(Boolean)
      .map((match) => {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        return [key, value];
      }),
  );
}

function databaseHint() {
  const env = { ...readRootEnv(), ...process.env };
  const host = env.POSTGRES_HOST ?? "localhost";
  const port = env.POSTGRES_PORT ?? "5432";
  const user = env.POSTGRES_USER ?? "postgres";
  const dbName = env.POSTGRES_DB ?? "quantyx";
  return `Make sure PostgreSQL is reachable at ${host}:${port} and database "${dbName}" exists. Create it manually, for example: createdb -h ${host} -p ${port} -U ${user} ${dbName}`;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question(
  "⚠️  This will WIPE your database and re-seed it. All data will be lost.\nAre you sure? (y/N): ",
  (answer) => {
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
    try {
      execSync("pnpm --filter @repo/db db:reset", { stdio: "inherit" });
      execSync("pnpm --filter @repo/db db:seed", { stdio: "inherit" });
      execSync("pnpm --filter api assets:upload-defaults", { stdio: "inherit" });
    } catch (err) {
      console.error("\nReset failed.");
      console.error(databaseHint());
      process.exit(1);
    }
  }
);
