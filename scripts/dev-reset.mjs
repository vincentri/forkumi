#!/usr/bin/env node
import { createInterface } from "readline";
import { execSync } from "child_process";

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
      execSync("pnpm --filter @repo/db exec prisma db push --force-reset", { stdio: "inherit" });
      execSync("pnpm --filter @repo/db exec prisma db seed", { stdio: "inherit" });
    } catch {
      process.exit(1);
    }
  }
);
