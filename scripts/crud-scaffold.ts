#!/usr/bin/env tsx
/**
 * pnpm crud:scaffold <model>
 *
 * Reads apps/api/src/crud/<model>.ts, derives a Prisma model block
 * from the defineCRUD config, then:
 *   1. Appends/updates the model in apps/api/prisma/schema.prisma
 *   2. Patches back-relations into target models for any relation multi-selects
 *   3. Adds the export to apps/api/src/crud/index.ts
 *   4. Runs pnpm --filter @repo/db db:migrate to apply schema changes
 *
 * Permissions are auto-derived at runtime via derivePermissionOptions()
 * from @repo/admin/server — no manual PERMISSION_OPTIONS step needed.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { pathToFileURL } from "url";
import { spawnSync } from "child_process";
import { config as dotenvConfig } from "dotenv";
import type { CRUDConfig, CRUDFieldGallery, CRUDFieldSchedule, CRUDFieldSelect, FieldType } from "../packages/crud/src/types";

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
  schedule: "String",
  gallery: "String",
  number: "Float",
  range: "Int",
  boolean: "Boolean",
  date: "DateTime",
  datetime: "DateTime",
};

function toPascalCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toKebabCase(str: string) {
  return str.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
}

function toSnakeCase(str: string) {
  return str.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`).replace(/^_/, "");
}

function toSnakePlural(str: string): string {
  const snake = toSnakeCase(str);
  if (snake.endsWith("s") && !snake.endsWith("ss")) return snake;
  if (snake.match(/[^aeiou]y$/)) return snake.slice(0, -1) + "ies";
  if (snake.match(/(s|x|z|ch|sh)$/)) return snake + "es";
  return snake + "s";
}

function singularizeFieldName(name: string): string {
  if (name.endsWith("ies")) return name.slice(0, -3) + "y";
  // Only strip "es" after a sibilant stem (boxes→box, dishes→dish); words like
  // "images"/"times"/"names" end in a silent "e" and must keep it (→ image/time/name).
  if (/(s|x|z|ch|sh)es$/.test(name)) return name.slice(0, -2);
  if (name.endsWith("ss")) return name;
  if (name.endsWith("s")) return name.slice(0, -1);
  return name;
}

/** Derive the relation accessor name from a FK field name, e.g. "blogCategoryId" → "blogCategory" */
function fkFieldToRelationName(fieldName: string): string {
  return fieldName.replace(/Id$/, "");
}

/** Build the explicit join model block for a many-to-many relation with `through` set */
function buildJoinModel(config: CRUDConfig, relField: CRUDFieldSelect): string {
  const through = relField.relation!.through!;
  const joinModelName = toPascalCase(through);                       // "BlogTag"
  const sourceModelName = toPascalCase(config.model);                // "Blog"
  const targetModelName = toPascalCase(relField.relation!.model);    // "Tag"
  const joinTableName = toSnakePlural(through);                      // "blog_tags"
  const joinThisField = config.model + "Id";                         // "blogId"
  const joinThatField = relField.relation!.model + "Id";             // "tagId"
  const snakeThisField = toSnakeCase(joinThisField);                 // "blog_id"
  const snakeThatField = toSnakeCase(joinThatField);                 // "tag_id"
  const sourceAccessor = config.model;                               // "blog"
  const targetAccessor = relField.relation!.model;                   // "tag"

  const pad = (name: string) => name + " ".repeat(Math.max(2, 8 - name.length));
  return [
    `model ${joinModelName} {`,
    `  ${pad(joinThisField)}String  @map("${snakeThisField}")`,
    `  ${pad(joinThatField)}String  @map("${snakeThatField}")`,
    `  ${pad(sourceAccessor)}${sourceModelName}  @relation(fields: [${joinThisField}], references: [id], onDelete: Cascade)`,
    `  ${pad(targetAccessor)}${targetModelName}  @relation(fields: [${joinThatField}], references: [id], onDelete: Cascade)`,
    ``,
    `  @@id([${joinThisField}, ${joinThatField}])`,
    `  @@map("${joinTableName}")`,
    `}`,
  ].join("\n");
}

function formatDefault(value: unknown, prismaType: string): string {
  if (value === "now" && (prismaType === "DateTime")) return "@default(now())";
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

/** Derive the child Prisma model name for a schedule field. */
function deriveChildModelName(config: CRUDConfig, field: CRUDFieldSchedule): string {
  if (field.childModelName) return field.childModelName;
  const parent = toPascalCase(config.model);
  const singular = singularizeFieldName(field.name);
  return `${parent}${toPascalCase(singular)}`;
}

/** Build the child Prisma model block for a schedule field. */
function buildScheduleChildModel(config: CRUDConfig, field: CRUDFieldSchedule): string {
  const childModelName = deriveChildModelName(config, field);
  const parentModelName = toPascalCase(config.model);
  const parentCamel = config.model;
  const fkField = `${parentCamel}Id`;
  const snakeFk = toSnakeCase(fkField);
  const childAccessor = field.name;
  const parentAccessor = parentCamel;
  const tableName = `${toSnakeCase(toSnakePlural(parentModelName))}_${toSnakeCase(childAccessor)}`;

  const pad = (name: string) => name + " ".repeat(Math.max(2, 12 - name.length));
  return [
    `model ${childModelName} {`,
    `  id           ${" ".repeat(Math.max(2, 12 - "id".length))}String   @id @default(cuid())`,
    `  ${pad(fkField)}String   @map("${snakeFk}")`,
    `  ${pad("dayOfWeek")}Int      @map("day_of_week")`,
    `  ${pad("openTime")}String?  @map("open_time")`,
    `  ${pad("closeTime")}String?  @map("close_time")`,
    `  ${pad(parentAccessor)}${parentModelName} @relation(fields: [${fkField}], references: [id], onDelete: Cascade)`,
    ``,
    `  @@unique([${fkField}, dayOfWeek])`,
    `  @@map("${tableName}")`,
    `}`,
  ].join("\n");
}

/** Derive the child Prisma model name for a gallery field. */
function deriveGalleryChildModelName(config: CRUDConfig, field: CRUDFieldGallery): string {
  if (field.childModelName) return field.childModelName;
  const parent = toPascalCase(config.model);
  const singular = singularizeFieldName(field.name);
  return `${parent}${toPascalCase(singular)}`;
}

/** Build the child Prisma model block for a gallery field. */
function buildGalleryChildModel(config: CRUDConfig, field: CRUDFieldGallery): string {
  const childModelName = deriveGalleryChildModelName(config, field);
  const parentModelName = toPascalCase(config.model);
  const parentCamel = config.model;
  const fkField = `${parentCamel}Id`;
  const snakeFk = toSnakeCase(fkField);
  const parentAccessor = parentCamel;
  // Table name uses the (already-plural) field name directly, not singular+"s",
  // so "media" → "..._media" (not "..._medias") and "images" → "..._images".
  const tableName = `${toSnakeCase(toSnakePlural(parentModelName))}_${toSnakeCase(field.name)}`;

  const pad = (name: string) => name + " ".repeat(Math.max(2, 12 - name.length));
  return [
    `model ${childModelName} {`,
    `  id           ${" ".repeat(Math.max(2, 12 - "id".length))}String   @id @default(cuid())`,
    `  ${pad(fkField)}String   @map("${snakeFk}")`,
    `  ${pad("url")}String`,
    `  ${pad("alt")}String?`,
    `  ${pad("position")}Int      @default(0) @map("position")`,
    `  ${pad(parentAccessor)}${parentModelName} @relation(fields: [${fkField}], references: [id], onDelete: Cascade)`,
    ``,
    `  @@unique([${fkField}, position])`,
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

    // Schedule field: emit a relation accessor on the parent (no scalar column).
    // The child model is appended separately by main().
    if (field.type === "schedule") {
      const sched = field as CRUDFieldSchedule;
      const childModelName = deriveChildModelName(config, sched);
      const accessor = field.name;
      const padding = " ".repeat(Math.max(1, 10 - accessor.length));
      lines.push(`  ${accessor}${padding}${childModelName}[]`);
      continue;
    }

    // Gallery field: emit a relation accessor on the parent (no scalar column).
    if (field.type === "gallery") {
      const gal = field as CRUDFieldGallery;
      const childModelName = deriveGalleryChildModelName(config, gal);
      const accessor = field.name;
      const padding = " ".repeat(Math.max(1, 10 - accessor.length));
      lines.push(`  ${accessor}${padding}${childModelName}[]`);
      continue;
    }

    if (field.type === "select") {
      const sel = field as CRUDFieldSelect;

      // Relation multi-select: emit a Prisma relation line, not a scalar column
      if (sel.multiple && sel.relation) {
        if (sel.relation.through) {
          // Explicit join model: emit accessor for join model (e.g. blogTags BlogTag[])
          const joinModelName = toPascalCase(sel.relation.through);
          const joinAccessor = sel.relation.through + "s";
          const padding = " ".repeat(Math.max(1, 10 - joinAccessor.length));
          lines.push(`  ${joinAccessor}${padding}${joinModelName}[]`);
        } else {
          // Implicit m2m (not recommended — use through for explicit table)
          const relModel = toPascalCase(sel.relation.model);
          const relField = sel.relation.field;
          const padding = " ".repeat(Math.max(1, 10 - relField.length));
          lines.push(`  ${relField}${padding}${relModel}[]`);
        }
        continue;
      }

      // Single-select FK (optionsFrom): emit FK column + @relation line
      if (sel.optionsFrom) {
        const prismaType = "String";
        const optional = !field.required;
        const typeStr = optional ? `${prismaType}?` : prismaType;
        const snakeName = toSnakeCase(field.name);
        const mapStr = snakeName !== field.name ? ` @map("${snakeName}")` : "";
        const colPadding = " ".repeat(Math.max(1, 10 - field.name.length));
        lines.push(`  ${field.name}${colPadding}${typeStr}${mapStr}`);

        // Emit the @relation line: e.g. blogCategory BlogCategory? @relation(...)
        const relName = fkFieldToRelationName(field.name);  // "blogCategory"
        const relModel = toPascalCase(sel.optionsFrom.model); // "BlogCategory"
        const relType = optional ? `${relModel}?` : relModel;
        const relPadding = " ".repeat(Math.max(1, 10 - relName.length));
        const onDelete = optional ? ", onDelete: SetNull" : "";
        lines.push(`  ${relName}${relPadding}${relType} @relation(fields: [${field.name}], references: [id]${onDelete})`);
        continue;
      }
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

/** Insert a line into a model block BEFORE the @@map / closing brace */
function insertIntoModelBlock(schema: string, targetModelName: string, line: string): string {
  const regex = new RegExp(`(model\\s+${targetModelName}\\s*\\{)([^}]*)(\\})`, "ms");
  return schema.replace(regex, (_, open, body, close) => {
    // Insert before @@map line if present, otherwise before closing brace
    const mapIdx = body.lastIndexOf("  @@map(");
    if (mapIdx !== -1) {
      return open + body.slice(0, mapIdx) + line + "\n" + body.slice(mapIdx) + close;
    }
    return open + body + line + "\n" + close;
  });
}

async function main() {
  const model = process.argv[2];

  if (!model) {
    console.error("Usage: pnpm crud:scaffold <model>");
    console.error("Example: pnpm crud:scaffold post");
    process.exit(1);
  }

  const root = resolve(new URL("..", import.meta.url).pathname);

  // Load .env so db:migrate (spawned below) has DB credentials in process.env
  dotenvConfig({ path: join(root, ".env") });

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

  // --- Update schema.prisma (source model) ---
  let updatedSchema = readFileSync(schemaPath, "utf-8");
  const modelBlock = isKeyValue ? buildKeyValuePrismaModel(config) : buildPrismaModel(config);

  const existingModelRegex = new RegExp(
    `(^model\\s+${modelName}\\s*\\{[^}]*\\})`,
    "ms",
  );

  if (existingModelRegex.test(updatedSchema)) {
    updatedSchema = updatedSchema.replace(existingModelRegex, modelBlock);
    writeFileSync(schemaPath, updatedSchema, "utf-8");
    console.log(`✓  Updated model ${modelName} in apps/api/prisma/schema.prisma`);
  } else {
    updatedSchema = updatedSchema.trimEnd() + "\n\n" + modelBlock + "\n";
    writeFileSync(schemaPath, updatedSchema, "utf-8");
    console.log(`✓  Added model ${modelName} to apps/api/prisma/schema.prisma`);
  }

  // --- Patch back-relations into target models for relation multi-selects ---
  const relationFields = config.fields.filter(
    (f): f is CRUDFieldSelect =>
      f.type === "select" && !!(f as CRUDFieldSelect).multiple && !!(f as CRUDFieldSelect).relation,
  );

  for (const relField of relationFields) {
    const sel = relField as CRUDFieldSelect;
    const targetModelName = toPascalCase(sel.relation!.model);   // e.g. "Tag"

    if (sel.relation!.through) {
      // Explicit join model: inject join model into schema + back-relation on target model
      const joinModelName = toPascalCase(sel.relation!.through);  // "BlogTag"
      const joinAccessor = sel.relation!.through + "s";            // "blogTags"

      // 1. Append join model if not already present
      updatedSchema = readFileSync(schemaPath, "utf-8");
      const joinModelRegex = new RegExp(`model\\s+${joinModelName}\\s*\\{`, "ms");
      if (!joinModelRegex.test(updatedSchema)) {
        const joinModelBlock = buildJoinModel(config, sel);
        updatedSchema = updatedSchema.trimEnd() + "\n\n" + joinModelBlock + "\n";
        writeFileSync(schemaPath, updatedSchema, "utf-8");
        console.log(`✓  Added join model ${joinModelName} (@@map("${toSnakePlural(sel.relation!.through)}")) to schema.prisma`);
      } else {
        console.log(`⚠  Join model ${joinModelName} already in schema.prisma — skipping.`);
      }

      // 2. Inject back-relation on target model (e.g. blogTags BlogTag[] on Tag)
      updatedSchema = readFileSync(schemaPath, "utf-8");
      const targetModelRegex = new RegExp(`model\\s+${targetModelName}\\s*\\{[^}]*\\}`, "ms");
      if (!targetModelRegex.test(updatedSchema)) {
        console.warn(`⚠  Target model ${targetModelName} not found in schema.prisma — add back-relation ${joinAccessor} ${joinModelName}[] manually.`);
        continue;
      }
      if (updatedSchema.match(new RegExp(`model\\s+${targetModelName}\\s*\\{[^}]*${joinModelName}\\[\\]`, "ms"))) {
        console.log(`⚠  Back-relation ${joinAccessor} ${joinModelName}[] already in model ${targetModelName} — skipping.`);
        continue;
      }
      const padding = " ".repeat(Math.max(1, 10 - joinAccessor.length));
      const backRelLine = `  ${joinAccessor}${padding}${joinModelName}[]`;
      updatedSchema = insertIntoModelBlock(updatedSchema, targetModelName, backRelLine);
      writeFileSync(schemaPath, updatedSchema, "utf-8");
      console.log(`✓  Added back-relation ${joinAccessor} ${joinModelName}[] to model ${targetModelName}`);

    } else {
      // Implicit m2m: inject back-relation pointing directly at source model
      const backRelField = toSnakePlural(config.model);             // e.g. "blogs"
      const sourceModelName = toPascalCase(config.model);           // e.g. "Blog"
      const padding = " ".repeat(Math.max(1, 10 - backRelField.length));
      const backRelLine = `  ${backRelField}${padding}${sourceModelName}[]`;

      updatedSchema = readFileSync(schemaPath, "utf-8");

      const targetModelRegex = new RegExp(`model\\s+${targetModelName}\\s*\\{[^}]*\\}`, "ms");
      if (!targetModelRegex.test(updatedSchema)) {
        console.warn(`⚠  Target model ${targetModelName} not found in schema.prisma — add back-relation ${backRelField} ${sourceModelName}[] manually.`);
        continue;
      }

      if (updatedSchema.match(new RegExp(`model\\s+${targetModelName}\\s*\\{[^}]*${sourceModelName}\\[\\]`, "ms"))) {
        console.log(`⚠  Back-relation ${backRelField} ${sourceModelName}[] already in model ${targetModelName} — skipping.`);
        continue;
      }

      updatedSchema = insertIntoModelBlock(updatedSchema, targetModelName, backRelLine);
      writeFileSync(schemaPath, updatedSchema, "utf-8");
      console.log(`✓  Added back-relation ${backRelField} ${sourceModelName}[] to model ${targetModelName}`);
    }
  }

  // --- Patch back-relations into target models for single-select FKs (optionsFrom) ---
  const fkFields = config.fields.filter(
    (f): f is CRUDFieldSelect =>
      f.type === "select" && !!(f as CRUDFieldSelect).optionsFrom && !(f as CRUDFieldSelect).multiple,
  );

  for (const fkField of fkFields) {
    const sel = fkField as CRUDFieldSelect;
    const targetModelName = toPascalCase(sel.optionsFrom!.model);
    const sourceModelName = toPascalCase(config.model);
    const backRelField = toSnakePlural(config.model); // e.g. "events"

    updatedSchema = readFileSync(schemaPath, "utf-8");
    const targetModelRegex = new RegExp(`model\\s+${targetModelName}\\s*\\{[^}]*\\}`, "ms");
    if (!targetModelRegex.test(updatedSchema)) {
      console.warn(`⚠  Target model ${targetModelName} not found in schema.prisma — add back-relation ${backRelField} ${sourceModelName}[] manually.`);
      continue;
    }
    if (updatedSchema.match(new RegExp(`model\\s+${targetModelName}\\s*\\{[^}]*${sourceModelName}\\[\\]`, "ms"))) {
      console.log(`⚠  Back-relation ${backRelField} ${sourceModelName}[] already in model ${targetModelName} — skipping.`);
      continue;
    }
    const padding = " ".repeat(Math.max(1, 10 - backRelField.length));
    const backRelLine = `  ${backRelField}${padding}${sourceModelName}[]`;
    updatedSchema = insertIntoModelBlock(updatedSchema, targetModelName, backRelLine);
    writeFileSync(schemaPath, updatedSchema, "utf-8");
    console.log(`✓  Added back-relation ${backRelField} ${sourceModelName}[] to model ${targetModelName}`);
  }

  // --- Append child models for schedule fields ---
  const scheduleFields = config.fields.filter(
    (f): f is CRUDFieldSchedule => f.type === "schedule",
  );
  for (const sched of scheduleFields) {
    const childModelName = deriveChildModelName(config, sched);
    updatedSchema = readFileSync(schemaPath, "utf-8");
    const childModelRegex = new RegExp(`model\\s+${childModelName}\\s*\\{`, "ms");
    if (childModelRegex.test(updatedSchema)) {
      console.log(`⚠  Child model ${childModelName} already in schema.prisma — skipping.`);
      continue;
    }
    const childBlock = buildScheduleChildModel(config, sched);
    updatedSchema = updatedSchema.trimEnd() + "\n\n" + childBlock + "\n";
    writeFileSync(schemaPath, updatedSchema, "utf-8");
    console.log(`✓  Added child model ${childModelName} for schedule field "${sched.name}"`);
  }

  // --- Append child models for gallery fields ---
  const galleryFlds = config.fields.filter(
    (f): f is CRUDFieldGallery => f.type === "gallery",
  );
  for (const gal of galleryFlds) {
    const childModelName = deriveGalleryChildModelName(config, gal);
    updatedSchema = readFileSync(schemaPath, "utf-8");
    const childModelRegex = new RegExp(`model\\s+${childModelName}\\s*\\{`, "ms");
    if (childModelRegex.test(updatedSchema)) {
      console.log(`⚠  Child model ${childModelName} already in schema.prisma — skipping.`);
      continue;
    }
    const childBlock = buildGalleryChildModel(config, gal);
    updatedSchema = updatedSchema.trimEnd() + "\n\n" + childBlock + "\n";
    writeFileSync(schemaPath, updatedSchema, "utf-8");
    console.log(`✓  Added child model ${childModelName} for gallery field "${gal.name}"`);
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

  // --- Run db:migrate with a deterministic name so the prompt is skipped ---
  const migrationName = `scaffold_${model}`;
  const prismaDir = join(root, "apps/api/prisma");
  console.log(`\nRunning prisma migrate dev --name ${migrationName} ...`);
  const result = spawnSync(
    "npx",
    ["prisma", "migrate", "dev", "--name", migrationName],
    { cwd: prismaDir, stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    console.error("\nMigration failed. Fix schema errors and re-run scaffold.");
    process.exit(result.status ?? 1);
  }

  // Regenerate Prisma client so the running dev server picks up new models
  console.log("\nRunning prisma generate ...");
  const genResult = spawnSync(
    "npx",
    ["prisma", "generate"],
    { cwd: prismaDir, stdio: "inherit", env: process.env },
  );
  if (genResult.status !== 0) {
    console.error("\nprisma generate failed.");
    process.exit(genResult.status ?? 1);
  }

  console.log(`\nDone! Nav link, tRPC routes (admin.${config.model}.*), and admin page are automatic.`);
  console.log(`Admin URL: /admin/${toKebabCase(config.model)}`);
}

main();
