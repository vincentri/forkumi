import type { CRUDConfig, CRUDField } from "@repo/crud";
import { RoleCRUD } from "../../../apps/api/src/crud/role";
import { SettingsCRUD } from "../../../apps/api/src/crud/setting";
import { UserCRUD } from "../../../apps/api/src/crud/user";

export interface ResourceEntry {
  config: CRUDConfig;
  slug: string;
  path: string;
  mode: "crud" | "keyValue";
  tableFields: CRUDField[];
  formFields: CRUDField[];
}

function modelToSlug(model: string): string {
  return model
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function visibleTableFields(config: CRUDConfig): CRUDField[] {
  return config.fields.filter((field) => field.showInTable !== false);
}

function visibleFormFields(config: CRUDConfig): CRUDField[] {
  return config.fields.filter((field) => field.showInForm !== false);
}

function toEntry(config: CRUDConfig): ResourceEntry {
  const slug = modelToSlug(config.model);

  return {
    config,
    slug,
    path: `/admin/${slug}`,
    mode: config.isKeyValue ? "keyValue" : "crud",
    tableFields: visibleTableFields(config),
    formFields: visibleFormFields(config),
  };
}

const ALL_CONFIGS: CRUDConfig[] = [UserCRUD, RoleCRUD, SettingsCRUD];
const ALL_ENTRIES = ALL_CONFIGS.map(toEntry);

export const tableEntries = ALL_ENTRIES.filter(
  (entry) => entry.mode === "crud" && entry.tableFields.length > 0,
);

export const readOnlyEntries = ALL_ENTRIES.filter(
  (entry) => entry.config.readOnly === true,
);

export const keyValueEntries = ALL_ENTRIES.filter(
  (entry) => entry.mode === "keyValue",
);
