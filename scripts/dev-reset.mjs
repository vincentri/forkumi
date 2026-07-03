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

function parseDatabaseUrl(url) {
  // postgresql://user:password@host:port/dbname
  const match = url?.match(/^postgresql:\/\/([^:]+)(?::([^@]+))?@([^:\/]+)(?::(\d+))?\/(.+)$/);
  if (!match) return null;
  return {
    user: match[1] ?? "postgres",
    password: match[2] ?? "",
    host: match[3] ?? "localhost",
    port: match[4] ?? "5432",
    dbName: match[5] ?? "quantyx",
  };
}

function databaseHint() {
  const env = { ...readRootEnv(), ...process.env };
  const db = parseDatabaseUrl(env.DATABASE_URL) ?? {
    host: "localhost",
    port: "5432",
    user: "postgres",
    dbName: "quantyx",
  };
  return `Make sure PostgreSQL is reachable at ${db.host}:${db.port} and database "${db.dbName}" exists. Create it manually, for example: createdb -h ${db.host} -p ${db.port} -U ${db.user} ${db.dbName}`;
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
