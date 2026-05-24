#!/usr/bin/env node
/**
 * pnpm crud:new
 *
 * Interactive CRUD resource generator.
 * Prompts for model name + fields, writes apps/api/src/crud/<model>.ts,
 * then calls crud:scaffold to update schema.prisma and the barrel.
 */

import { createInterface } from "readline";
import { existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const VALID_TYPES = [
  "text",
  "textarea",
  "richtext",
  "number",
  "boolean",
  "date",
  "email",
  "url",
  "select",
  "multicheck",
  "password",
  "color",
  "range",
  "image",
  "file",
];

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toLabel(name) {
  // "productTitle" → "Product Title"
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function pluralLabel(name) {
  const base = toPascalCase(name);
  const lower = name.toLowerCase();
  // already plural
  if (lower.endsWith("s") && !lower.endsWith("ss")) return base;
  // consonant + y → ies (gallery → Galleries, category → Categories)
  if (lower.match(/[^aeiou]y$/)) return base.slice(0, -1) + "ies";
  // s, x, z, ch, sh → es (beach → Beaches)
  if (lower.match(/(s|x|z|ch|sh)$/)) return base + "es";
  return base + "s";
}

async function promptField(index) {
  console.log(`\n  Field ${index}:`);

  const rawName = (await ask("    Name (leave blank to finish): ")).trim();
  if (!rawName) return null;

  // Validate name
  if (!/^[a-z][a-zA-Z0-9]*$/.test(rawName)) {
    console.log("    ✗  Field name must start with a lowercase letter and contain only letters/numbers. Try again.");
    return promptField(index);
  }

  // Type
  let type = "";
  while (!VALID_TYPES.includes(type)) {
    const raw = await ask(`    Type [${VALID_TYPES.join("|")}] (default: text): `);
    type = raw.trim() || "text";
    if (!VALID_TYPES.includes(type)) {
      console.log(`    ✗  Invalid type. Choose one of: ${VALID_TYPES.join(", ")}`);
    }
  }

  // Required
  const reqRaw = (await ask("    Required? [y/N]: ")).trim().toLowerCase();
  const required = reqRaw === "y" || reqRaw === "yes";

  // Select / multicheck options
  let options = null;
  if (type === "select" || type === "multicheck") {
    const raw = await ask("    Options (comma-separated values, e.g. draft,published,archived): ");
    options = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (options.length === 0) {
      console.log(`    ✗  ${type} fields require at least one option. Using ['option1', 'option2'].`);
      options = ["option1", "option2"];
    }
  }

  return { name: rawName, type, required, options };
}

function buildConfigFile(model, label, fields) {
  const pascalModel = toPascalCase(model);
  const exportName = `${pascalModel}CRUD`;

  const fieldLines = fields.map((f) => {
    const parts = [`name: '${f.name}'`, `type: '${f.type}'`, `label: '${toLabel(f.name)}'`];
    if (f.required) parts.push("required: true");
    if (f.options) {
      const opts = f.options.map((v) => `{ label: '${toLabel(v)}', value: '${v}' }`).join(", ");
      parts.push(`options: [${opts}]`);
    }
    return `    { ${parts.join(", ")} }`;
  });

  return `import { defineCRUD } from '@repo/crud'

export const ${exportName} = defineCRUD({
  model: '${model}',
  label: '${label}',
  fields: [
${fieldLines.join(",\n")}
  ],
})
`;
}

async function main() {
  console.log("\quantyx — new CRUD resource\n");

  // Model name
  let model = "";
  while (!model) {
    const raw = (await ask("Model name (lowercase, e.g. 'post', 'product'): ")).trim();
    if (!/^[a-z][a-z0-9]*$/.test(raw)) {
      console.log("  ✗  Model name must be lowercase letters/numbers only.");
    } else {
      model = raw;
    }
  }

  const defaultLabel = pluralLabel(model);
  const rawLabel = (await ask(`Label (default: ${defaultLabel}): `)).trim();
  const label = rawLabel || defaultLabel;

  // Fields
  console.log("\nAdd fields (press Enter with empty name when done):");
  const fields = [];
  let i = 1;
  while (true) {
    const field = await promptField(i);
    if (!field) break;
    fields.push(field);
    i++;
  }

  if (fields.length === 0) {
    console.log("\n✗  No fields defined. Aborting.");
    rl.close();
    process.exit(1);
  }

  rl.close();

  // Write config file
  const configDir = resolve(root, "apps/api/src/crud");
  const configPath = resolve(configDir, `${model}.ts`);

  if (existsSync(configPath)) {
    console.log(`\n⚠  apps/api/src/crud/${model}.ts already exists — not overwriting.`);
    console.log(`   Delete it and re-run, or use pnpm crud:scaffold ${model} to scaffold without re-creating the config.`);
    process.exit(1);
  }

  const content = buildConfigFile(model, label, fields);
  writeFileSync(configPath, content, "utf-8");
  console.log(`\n✓  Created apps/api/src/crud/${model}.ts`);

  // Call crud:scaffold
  console.log(`\nRunning pnpm crud:scaffold ${model}...\n`);
  try {
    execSync(`pnpm crud:scaffold ${model}`, { cwd: root, stdio: "inherit" });
  } catch {
    console.error("\n✗  crud:scaffold failed. Check the output above.");
    process.exit(1);
  }

  console.log("\nNext step:");
  console.log(`  pnpm db:push`);
}

main();
