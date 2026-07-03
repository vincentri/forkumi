/**
 * Imports all CRUD configs from the API and normalizes them into
 * ResourceEntry objects that the generic test suite can iterate.
 *
 * Singular label derivation mirrors CRUDPage.tsx:
 *   config.label.replace(/s$/, "")
 */

import type { CRUDConfig, CRUDField } from "@repo/crud";

// ── Types ─────────────────────────────────────────────

export interface ResourceEntry {
  config: CRUDConfig;
  url: string;
  singular: string;
  fields: CRUDField[];
  requiredFields: CRUDField[];
  uniqueFields: CRUDField[];
  firstTextField: CRUDField | undefined;
  creatable: boolean;
  editable: boolean;
  deletable: boolean;
  mode: "crud" | "keyValue";
}

// ── URL helper ────────────────────────────────────────

function modelToUrl(model: string): string {
  const slug = model
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
  return `/admin/${slug}`;
}

// ── Config imports ────────────────────────────────────

// Import each config individually to avoid pulling in the entire barrel
// (which includes server-side code that shouldn't run in the browser).
// These are the config objects — they're plain data, no server deps.

import { UserCRUD } from "../../../apps/api/src/crud/user";
import { RoleCRUD } from "../../../apps/api/src/crud/role";
import { BlogCRUD } from "../../../apps/api/src/crud/blog";
import { BlogCategoryCRUD } from "../../../apps/api/src/crud/blogCategory";
import { PageCRUD } from "../../../apps/api/src/crud/page";
import { NewsletterSubscriberCRUD } from "../../../apps/api/src/crud/newsletterSubscriber";

// ── Entry builder ─────────────────────────────────────

function toEntry(config: CRUDConfig): ResourceEntry {
  const singular = config.label.replace(/s$/, "");
  const fields = config.fields.filter((f) => f.showInForm !== false);
  const requiredFields = fields.filter((f) => f.required);
  const uniqueFields = fields.filter((f) => f.unique);
  const firstTextField = fields.find((f) =>
    ["text", "email", "textarea"].includes(f.type) && !f.slugFrom,
  );
  const mode = config.mode ?? "crud";
  const isReadOnly = config.readOnly === true;

  return {
    config,
    url: modelToUrl(config.model),
    singular,
    fields,
    requiredFields,
    uniqueFields,
    firstTextField,
    creatable: mode === "crud" && config.creatable !== false && !isReadOnly,
    editable: mode === "crud" && config.editable !== false && !isReadOnly,
    deletable: mode === "crud" && config.deletable !== false && !isReadOnly,
    mode,
  };
}

// ── All entries ───────────────────────────────────────

const ALL_CONFIGS: CRUDConfig[] = [
  UserCRUD,
  RoleCRUD,
  BlogCRUD,
  BlogCategoryCRUD,
  PageCRUD,
  NewsletterSubscriberCRUD,
];

const ALL_ENTRIES = ALL_CONFIGS.map(toEntry);

/** Table-mode resources that support full CRUD lifecycle. */
export const tableEntries = ALL_ENTRIES.filter(
  (e) => e.mode === "crud" && e.creatable,
);

/** Read-only table-mode resources (list only, no create/edit/delete). */
export const readOnlyEntries = ALL_ENTRIES.filter(
  (e) => e.mode === "crud" && !e.creatable,
);

/** keyValue-mode resources (Settings, FrontPageSettings). */
export const keyValueEntries = ALL_ENTRIES.filter((e) => e.mode === "keyValue");
