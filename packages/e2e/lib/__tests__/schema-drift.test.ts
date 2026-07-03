import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { API_PRISMA_DIR, E2E_PRISMA_DIR } from "../paths";

/**
 * Bidirectional drift guard for the e2e schema.
 *
 * 1. Every model in e2e must exist in prod with matching fields.
 *    (prevents e2e from drifting out of sync with prod)
 *
 * 2. Every model in prod must either exist in e2e OR be in EXCLUDED_MODELS.
 *    (prevents prod from adding models that e2e silently ignores)
 *
 * When you add a new model to apps/api/prisma/schema.prisma:
 *   - If it's needed by e2e specs → add it to packages/e2e/prisma/schema.prisma
 *   - If it's intentionally excluded → add its name to EXCLUDED_MODELS below
 *
 * The exclude list is version-controlled. Every entry here is a deliberate
 * decision to not test that model at the e2e level.
 */

const PROD_SCHEMA_PATH = resolve(API_PRISMA_DIR, "schema.prisma");
const E2E_SCHEMA_PATH = resolve(E2E_PRISMA_DIR, "schema.prisma");

/**
 * Models present in prod but intentionally absent from e2e.
 * Review this list whenever the prod schema gains a new model.
 */
const EXCLUDED_MODELS = new Set([
  "Tag",
  "Blog",
  "BlogCategory",
  "BlogTag",
  "Event",
  "EventCategory",
  "Slider",
  "SidebarPinnedEvent",
  "Page",
  "Contact",
  "ContactTopic",
  "NewsletterSubscriber",
  "Restaurant",
  "RestaurantOperationTime",
  "Comment",
]);

function loadSchema(path: string): string {
  return readFileSync(path, "utf8");
}

function stripNoise(src: string): string {
  return src
    // Strip inline and full-line // comments (preserve non-comment content)
    .replace(/\/\/.*$/gm, "")
    // Strip /* ... */ block comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Strip generator blocks
    .replace(/generator\s+\w+\s*\{[^}]*\}/g, "")
    // Strip datasource blocks
    .replace(/datasource\s+\w+\s*\{[^}]*\}/g, "");
}

function extractModels(src: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /model\s+(\w+)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(src)) !== null) {
    const name = match[1];
    const body = match[2]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
    out.set(name, body);
  }
  return out;
}

/**
 * Strip relation fields whose target model isn't in the `e2eModelNames` set.
 * The e2e schema is a structural subset of prod, so prod models will have
 * relation fields pointing to other models that e2e doesn't declare — those
 * would otherwise cause spurious field-signature mismatches.
 */
function stripRelationsToMissingModels(
  body: string,
  e2eModelNames: Set<string>,
): string {
  return body
    .split("\n")
    .filter((line) => {
      const m = line.match(/^\s*(\w+)\s+([A-Z]\w*)(\[\])?(\?)?\s*$/);
      if (!m) return true;
      const type = m[2];
      const isRelation = Boolean(m[3]) || Boolean(m[4]);
      if (!isRelation) return true;
      return e2eModelNames.has(type);
    })
    .join("\n");
}

describe("e2e schema drift", () => {
  const prodModels = extractModels(stripNoise(loadSchema(PROD_SCHEMA_PATH)));
  const e2eModels = extractModels(stripNoise(loadSchema(E2E_SCHEMA_PATH)));
  const e2eModelNames = new Set(e2eModels.keys());

  it("e2e schema has at least one model", () => {
    expect(e2eModels.size).toBeGreaterThan(0);
  });

  // ── e2e ⊆ prod ──────────────────────────────────────
  for (const [name, body] of e2eModels) {
    it(`e2e model "${name}" exists in prod with matching fields`, () => {
      const prodBody = prodModels.get(name);
      expect(
        prodBody,
        `e2e schema declares model "${name}" but prod schema does not`,
      ).toBeDefined();
      const e2eBody = stripRelationsToMissingModels(body, e2eModelNames);
      const normalizedProd = stripRelationsToMissingModels(prodBody!, e2eModelNames);
      expect(
        e2eBody,
        `model "${name}" field signatures differ between e2e and prod schemas`,
      ).toBe(normalizedProd);
    });
  }

  // ── prod ⊆ e2e ∪ EXCLUDED ──────────────────────────
  for (const [name] of prodModels) {
    it(`prod model "${name}" is in e2e or explicitly excluded`, () => {
      const inE2e = e2eModels.has(name);
      const excluded = EXCLUDED_MODELS.has(name);
      expect(
        inE2e || excluded,
        [
          `prod model "${name}" is not in e2e and not in EXCLUDED_MODELS.`,
          `Either add it to packages/e2e/prisma/schema.prisma,`,
          `or add it to EXCLUDED_MODELS.`,
        ].join(" "),
      ).toBe(true);
    });
  }
});
