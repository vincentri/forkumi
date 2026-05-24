#!/usr/bin/env tsx
/**
 * pnpm crud:scaffold <model>
 *
 * Reads apps/api/src/crud/<model>.ts, derives a Prisma model block
 * from the defineCRUD config, then:
 *   1. Appends the model to packages/db/prisma/schema.prisma
 *   2. Adds the export to apps/api/src/crud/index.ts
 *
 * Permissions are auto-derived at runtime via derivePermissionOptions()
 * from @repo/admin/server — no manual PERMISSION_OPTIONS step needed.
 *
 * Run after writing your defineCRUD config, before pnpm db:push.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { pathToFileURL } from "url";
import type { CRUDConfig, FieldType } from "../packages/crud/src/types";

const RESERVED_FIELDS = new Set(["id", "createdAt", "updatedAt"]);

const FIELD_TYPE_MAP: Record<FieldType, string> = {
  text: "String",
  textarea: "String",
  richtext: "String",
  email: "String",
  url: "String",
  password: "String",
  color: "String",
  select: "String",
  multicheck: "String",
  image: "String",
  file: "String",
  number: "Float",
  range: "Int",
  boolean: "Boolean",
  date: "DateTime",
};

function toPascalCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toKebabCase(str: string) {
  return str.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
}

function toSnakeCase(str: string) {
  return str.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
}

function toSnakePlural(str: string): string {
  const snake = toSnakeCase(str);
  if (snake.endsWith("s") && !snake.endsWith("ss")) return snake;
  if (snake.match(/[^aeiou]y$/)) return snake.slice(0, -1) + "ies";
  if (snake.match(/(s|x|z|ch|sh)$/)) return snake + "es";
  return snake + "s";
}

function formatDefault(value: unknown, prismaType: string): string {
  if (typeof value === "string") return `@default("${value}")`;
  if (typeof value === "boolean") return `@default(${value})`;
  if (typeof value === "number") return `@default(${value})`;
  if (prismaType === "Boolean") return `@default(false)`;
  return "";
}

function buildKeyValuePrismaModel(config: CRUDConfig): string {
  const modelName = toPascalCase(config.model);
  const tableName = toSnakePlural(config.model);
  return [
    `model ${modelName} {`,
    `  id        String   @id @default(cuid())`,
    `  key       String   @unique`,
    `  namespace String?`,
    `  value     String?`,
    `  createdAt DateTime @default(now()) @map("created_at")`,
    `  updatedAt DateTime @updatedAt     @map("updated_at")`,
    ``,
    `  @@map("${tableName}")`,
    `}`,
  ].join("\n");
}

function buildPrismaModel(config: CRUDConfig): string {
  const modelName = toPascalCase(config.model);
  const lines: string[] = [`model ${modelName} {`];
  lines.push(`  id        String   @id @default(cuid())`);

  for (const field of config.fields) {
    if (RESERVED_FIELDS.has(field.name)) {
      console.error(
        `Error: Field "${field.name}" is reserved (auto-injected by scaffold). Remove it from your defineCRUD config.`,
      );
      process.exit(1);
    }

    const prismaType = FIELD_TYPE_MAP[field.type] ?? "String";
    const optional = !field.required;
    const typeStr = optional ? `${prismaType}?` : prismaType;

    const defaultStr =
      field.default !== undefined
        ? ` ${formatDefault(field.default, prismaType)}`
        : field.type === "boolean"
          ? " @default(false)"
          : "";

    const snakeName = toSnakeCase(field.name);
    const mapStr = snakeName !== field.name ? ` @map("${snakeName}")` : "";
    const padding = " ".repeat(Math.max(1, 10 - field.name.length));
    lines.push(`  ${field.name}${padding}${typeStr}${defaultStr}${mapStr}`);
  }

  lines.push(`  createdAt DateTime @default(now()) @map("created_at")`);
  lines.push(`  updatedAt DateTime @updatedAt     @map("updated_at")`);
  lines.push(``);
  lines.push(`  @@map("${toSnakePlural(config.model)}")`);
  lines.push(`}`);

  return lines.join("\n");
}

async function main() {
  const model = process.argv[2];

  if (!model) {
    console.error("Usage: pnpm crud:scaffold <model>");
    console.error("Example: pnpm crud:scaffold post");
    process.exit(1);
  }

  const root = resolve(new URL("..", import.meta.url).pathname);
  const configPath = join(root, "apps/api/src/crud", `${model}.ts`);
  const schemaPath = join(root, "apps/api/prisma/schema.prisma");
  const barrelPath = join(root, "apps/api/src/crud/index.ts");

  // --- Load config ---
  let config: CRUDConfig;
  try {
    const mod = await import(pathToFileURL(configPath).href);
    const exportName = `${toPascalCase(model)}CRUD`;
    config = mod[exportName] ?? Object.values(mod).find((v) => v && typeof v === "object" && "model" in (v as object));
    if (!config) {
      console.error(
        `Error: Could not find a CRUDConfig export in ${configPath}.\n` +
          `Expected a named export "${exportName}" or any object with a "model" field.`,
      );
      process.exit(1);
    }
  } catch {
    console.error(
      `Error: Could not load ${configPath}\n` +
        `Create apps/api/src/crud/${model}.ts with a defineCRUD config first.`,
    );
    process.exit(1);
  }

  if (!config.fields || config.fields.length === 0) {
    console.error("Error: defineCRUD config has no fields. Add at least one field before scaffolding.");
    process.exit(1);
  }

  const modelName = toPascalCase(config.model);
  const exportName = `${modelName}CRUD`;
  const isKeyValue = config.mode === "keyValue";

  if (isKeyValue) {
    const missingNamespace = config.fields.filter((f) => !f.namespace);
    if (missingNamespace.length > 0) {
      console.error(
        `Error: keyValue fields must have a namespace.\n` +
        `Missing namespace on: ${missingNamespace.map((f) => `"${f.name}"`).join(", ")}\n` +
        `Add namespace: "..." to each field in your defineCRUD config.`,
      );
      process.exit(1);
    }
  }

  // --- Update schema.prisma ---
  const schema = readFileSync(schemaPath, "utf-8");
  const modelBlock = isKeyValue ? buildKeyValuePrismaModel(config) : buildPrismaModel(config);

  // Match the existing model block: from "model Name {" to its closing "}"
  const existingModelRegex = new RegExp(
    `(^model\\s+${modelName}\\s*\\{[^}]*\\})`,
    "ms",
  );

  let updatedSchema: string;
  if (existingModelRegex.test(schema)) {
    updatedSchema = schema.replace(existingModelRegex, modelBlock);
    writeFileSync(schemaPath, updatedSchema, "utf-8");
    console.log(`✓  Updated model ${modelName} in apps/api/prisma/schema.prisma`);
  } else {
    updatedSchema = schema.trimEnd() + "\n\n" + modelBlock + "\n";
    writeFileSync(schemaPath, updatedSchema, "utf-8");
    console.log(`✓  Added model ${modelName} to apps/api/prisma/schema.prisma`);
  }

  // --- Update barrel ---
  const barrel = readFileSync(barrelPath, "utf-8");
  const exportLine = `export { ${exportName} } from "./${model}";`;

  if (barrel.includes(exportLine)) {
    console.log(`⚠  ${exportName} already exported in crud/index.ts — skipping barrel update.`);
  } else {
    const updated = barrel.trimEnd() + "\n" + exportLine + "\n";
    writeFileSync(barrelPath, updated, "utf-8");
    console.log(`✓  Added ${exportName} to apps/api/src/crud/index.ts`);
  }

  console.log(`\nDone! Run pnpm db:push to apply the schema.`);
  console.log(`Nav link, tRPC routes (admin.${config.model}.*), and admin page are automatic.`);
  if (config.model !== model) {
    console.log(`Admin URL: /admin/${toKebabCase(config.model)}`);
  } else {
    console.log(`Admin URL: /admin/${model}`);
  }
}

main();
