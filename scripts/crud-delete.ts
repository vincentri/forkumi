#!/usr/bin/env tsx
/**
 * pnpm crud:delete <model>
 *
 * Removes a CRUD resource config, its barrel export, and the matching Prisma model block.
 * Run pnpm db:push afterwards to apply the schema change to your database.
 */

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { createInterface } from "readline";
import { join, resolve } from "path";

function toPascalCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolveAnswer) => {
    rl.question(question, (answer) => {
      rl.close();
      resolveAnswer(answer);
    });
  });
}

async function main() {
  const model = process.argv[2];
  const yes = process.argv.includes("--yes") || process.argv.includes("-y");

  if (!model) {
    console.error("Usage: pnpm crud:delete <model> [--yes]");
    console.error("Example: pnpm crud:delete product");
    process.exit(1);
  }

  if (!/^[a-z][a-zA-Z0-9]*$/.test(model)) {
    console.error("Error: model must start with a lowercase letter and contain only letters/numbers.");
    process.exit(1);
  }

  const root = resolve(new URL("..", import.meta.url).pathname);
  const configPath = join(root, "apps/api/src/crud", `${model}.ts`);
  const schemaPath = join(root, "apps/api/prisma/schema.prisma");
  const barrelPath = join(root, "apps/api/src/crud/index.ts");
  const modelName = toPascalCase(model);
  const exportName = `${modelName}CRUD`;

  if (!yes) {
    const answer = await ask(
      `This will delete CRUD "${model}" from config, barrel exports, and schema.prisma.\nAre you sure? (y/N): `,
    );
    if (answer.trim().toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  let changed = false;

  if (existsSync(configPath)) {
    unlinkSync(configPath);
    changed = true;
    console.log(`✓  Removed apps/api/src/crud/${model}.ts`);
  } else {
    console.log(`⚠  apps/api/src/crud/${model}.ts not found — skipping file removal.`);
  }

  if (existsSync(barrelPath)) {
    const barrel = readFileSync(barrelPath, "utf-8");
    const exportRegex = new RegExp(`^export\\s+\\{\\s*${escapeRegExp(exportName)}\\s*\\}\\s+from\\s+["']\\./${escapeRegExp(model)}["'];\\s*\\n?`, "m");
    const updatedBarrel = barrel.replace(exportRegex, "");
    if (updatedBarrel !== barrel) {
      writeFileSync(barrelPath, updatedBarrel, "utf-8");
      changed = true;
      console.log(`✓  Removed ${exportName} from apps/api/src/crud/index.ts`);
    } else {
      console.log(`⚠  ${exportName} export not found in apps/api/src/crud/index.ts.`);
    }
  }

  if (existsSync(schemaPath)) {
    const schema = readFileSync(schemaPath, "utf-8");
    const modelRegex = new RegExp(`\\n?^model\\s+${escapeRegExp(modelName)}\\s*\\{[\\s\\S]*?^\\}\\s*\\n?`, "m");
    const updatedSchema = schema.replace(modelRegex, "\n");
    if (updatedSchema !== schema) {
      writeFileSync(schemaPath, updatedSchema.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", "utf-8");
      changed = true;
      console.log(`✓  Removed model ${modelName} from apps/api/prisma/schema.prisma`);
    } else {
      console.log(`⚠  model ${modelName} not found in apps/api/prisma/schema.prisma.`);
    }
  }

  if (!changed) {
    console.log("Nothing changed.");
    return;
  }

  console.log("\nDone! Run pnpm db:push to apply the schema change.");
}

main();
