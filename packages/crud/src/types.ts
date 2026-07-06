export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "select"
  | "color"
  | "password"
  | "range"
  | "multicheck"
  | "image"
  | "file"
  | "schedule"
  | "gallery"
  | "separator";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectOptionsFrom {
  /** Prisma model/client key to load options from, e.g. "category" for db.category */
  model: string;
  /** Field used as the submitted value. Usually "id". */
  valueField: string;
  /** Field used as the visible label. Usually "name" or "title". */
  labelField: string;
  /** Optional Prisma where clause for simple conditions. */
  where?: Record<string, unknown>;
  /** Optional Prisma orderBy clause. */
  orderBy?: Record<string, unknown>;
  /** Maximum options returned by the server-side search. Defaults to 50. */
  limit?: number;
  /** Fields to search on when the user types. Defaults to [labelField]. */
  searchFields?: string[];
}

interface SelectDisplayOptions {
  /** In table cells, show the raw value or the matching option label. Defaults to "label" for optionsFrom fields, "value" for static/optionsQuery fields. */
  table?: "value" | "label";
  /** In filter cells, render a free text input or select dropdown. Defaults to "select" for select fields. */
  filter?: "text" | "select";
}

interface PrismaModelDelegate {
  findMany: (args: any) => Promise<any>;
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  deleteMany: (args?: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
  upsert: (args: any) => Promise<any>;
}

export type PrismaLikeClient = Record<string, PrismaModelDelegate>;

interface CRUDQueryContext {
  db: PrismaLikeClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx?: any;
  /** Passed to server-side option queries when the user searches or a value is already selected. */
  search?: string;
  selected?: string;
}

interface CRUDListQueryContext extends CRUDQueryContext {
  input: QueryState & { page: number; pageSize: number };
  baseWhere: Record<string, unknown>;
  orderBy: Record<string, unknown>;
  skip: number;
  take: number;
}

interface CRUDQueryHooks {
  /**
   * Escape hatch for complex list queries: joins, aggregates, computed columns, tenant-specific rules.
   * Return the same shape as the generated list procedure.
   */
  list?: (args: CRUDListQueryContext) => Promise<{
    items: Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
  }>;
}

export interface CRUDAssetReplacementContext {
  model: string;
  id?: string;
  field: CRUDFieldImage | CRUDFieldFile | CRUDFieldGallery;
  oldValue: string;
  newValue: string | null;
}

export interface CRUDRouterOptions {
  onAssetReplaced?: (args: CRUDAssetReplacementContext) => Promise<void> | void;
}

export type CRUDDeletePolicyAction = "restrict" | "setNull" | "setValue" | "ignore";

export interface CRUDDeletePolicy {
  /** Prisma model/client key containing records that point at this CRUD resource. */
  referencingModel: string;
  /** Field on the referencing model that stores the deleted record's id/value. */
  referencingField: string;
  /**
   * Behavior before deleting this record:
   * - "restrict": block deletion when related rows exist
   * - "setNull": set referencingField to null
   * - "setValue": set referencingField to value
   * - "ignore": leave referencing rows untouched
   */
  onDelete: CRUDDeletePolicyAction;
  /** Fallback value used by setValue. */
  value?: string | null;
  /** Optional error message for restrict failures. */
  message?: string;
}

export type CRUDFormLayoutItem =
  | string
  | {
      field: string;
      span?: 1 | 2 | 3 | 4;
    };

export interface CRUDFormLayoutColumn {
  /** Relative width for this column in a multi-column layout. Defaults to 1. */
  weight?: 1 | 2 | 3 | 4;
  rows: CRUDFormLayoutItem[][];
}

export interface CRUDFormLayoutSection {
  section?: string;
  columns?: CRUDFormLayoutColumn[];
  rows?: CRUDFormLayoutItem[][];
}

interface CRUDFieldVisibilityCondition {
  field: string;
  equals?: unknown;
  notEquals?: unknown;
  in?: unknown[];
  truthy?: boolean;
}

interface CRUDFieldBase {
  name: string;
  label: string;
  required?: boolean;
  default?: unknown;
  placeholder?: string;
  /** Show in table columns? Default: true (password defaults to false) */
  showInTable?: boolean;
  /** Show in form? Default: true */
  showInForm?: boolean;
  /** Allow clicking column header to sort? Default: true */
  sortable?: boolean;
  /** Tab group label for keyValue settings and CRUD create/edit forms */
  tab?: string;
  /** Namespace stored as a DB column on keyValue rows — enables filtered queries */
  namespace?: string;
  /** For localized keyValue resources, set false to save the same value for every locale. Defaults to true. */
  localized?: boolean;
  /** Small helper text displayed below the field */
  note?: string;
  /** Form width in keyValue forms. Defaults to full width. */
  width?: "full" | "half";
  /** Conditionally show this field based on another field's current form value. */
  visibleWhen?: CRUDFieldVisibilityCondition;
  /** Enable server-side filtering and show a table column filter. Defaults to true except password and multicheck fields. */
  filterable?: boolean;
  /** Enforce uniqueness — pre-flight check on create/update before hitting the DB */
  unique?: boolean;
  /** Auto-generate this field's value as a slug derived from another field's name (e.g. "title") */
  slugFrom?: string;
}

export interface CRUDFieldRange extends CRUDFieldBase {
  type: "range";
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Step size (default: 1) */
  step?: number;
}

export interface CRUDFieldSelect extends CRUDFieldBase {
  type: "select";
  /** Static options for simple selects. Dynamic options are merged into this at runtime. */
  options?: SelectOption[];
  /** Load options from another Prisma model with a simple config-driven query. */
  optionsFrom?: SelectOptionsFrom;
  /** Load options with a custom server-side query. Stripped before config is sent to the client. */
  optionsQuery?: (args: CRUDQueryContext) => Promise<SelectOption[]>;
  /** Internal client-safe marker used when optionsQuery was stripped before serialization. */
  hasDynamicOptions?: boolean;
  /** Controls how select values render in lists and filters. */
  display?: SelectDisplayOptions;
  /** When true, allows selecting multiple values (stored as string[]) */
  multiple?: boolean;
  /**
   * When set alongside `multiple: true`, treats this field as a Prisma relation
   * (many-to-many). The value array is never stored as a scalar column — it is
   * translated to `{ set: [{id},...] }` on write and read back via `include`.
   */
  relation?: {
    /** Prisma relation accessor on this model, e.g. "tags" */
    field: string;
    /** Target Prisma model key (lowercase), e.g. "tag" */
    model: string;
    /** Explicit join model key — scaffold generates a named join table (e.g. "blogTag" → blog_tags with blog_id/tag_id) */
    through?: string;
  };
}

export interface CRUDFieldMulticheck extends CRUDFieldBase {
  type: "multicheck";
  /** Required for multicheck fields — list of {label, value} checkboxes */
  options: SelectOption[];
  /**
   * Storage: values are stored as a comma-separated String in Postgres (e.g. "tag1,tag2,tag3").
   * For array semantics (filtering by single value), parse/serialize manually or switch to a
   * Prisma Json type in your schema and remove this field from the CRUD builder.
   */
}

export interface CRUDFieldImage extends CRUDFieldBase {
  type: "image";
  uploadUrl?: string;
  maxSizeMB?: number;
}

export interface CRUDFieldFile extends CRUDFieldBase {
  type: "file";
  uploadUrl?: string;
  accept?: string;
  maxSizeMB?: number;
}

export interface CRUDFieldSeparator extends CRUDFieldBase {
  type: "separator";
}

export interface CRUDFieldSchedule extends CRUDFieldBase {
  type: "schedule";
  /** Optional custom day labels. Defaults to ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]. */
  dayLabels?: string[];
  /** Optional explicit child model name. Defaults to {ParentModel}{PascalSingular(field.name)}. */
  childModelName?: string;
}

export interface CRUDFieldGallery extends CRUDFieldBase {
  type: "gallery";
  /** Upload endpoint. Each image POSTs to this URL and stores the returned path. */
  uploadUrl: string;
  /** Optional max upload size in MB. Defaults to 5. */
  maxSizeMB?: number;
  /** Optional explicit child model name. Defaults to {ParentModel}{PascalSingular(field.name)}. */
  childModelName?: string;
}

interface CRUDFieldOther extends CRUDFieldBase {
  type: Exclude<FieldType, "select" | "range" | "multicheck" | "image" | "file" | "schedule" | "gallery" | "separator">;
}

export type CRUDField = CRUDFieldSelect | CRUDFieldRange | CRUDFieldMulticheck | CRUDFieldImage | CRUDFieldFile | CRUDFieldSeparator | CRUDFieldSchedule | CRUDFieldGallery | CRUDFieldOther;

export interface QueryState {
  page: number;
  search?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string | boolean | null>;
}

import type { UseFormReturn } from "react-hook-form";

export interface CRUDConfig {
  /** Prisma model name — lowercase (e.g. "product" for model Product) */
  model: string;
  /** Display label for the admin UI (e.g. "Products") */
  label: string;
  fields: CRUDField[];
  /**
   * Rendering mode:
   * - "crud" (default): table + modal CRUD
   * - "keyValue": settings-style form, data stored in shared key_values table
   */
  mode?: "crud" | "keyValue";
  /**
   * Locales available for the locale switcher on keyValue resources. First entry
   * is the default. Omit to keep the resource single-locale (legacy behavior).
   * Only applies when `mode === "keyValue"`.
   */
  supportedLocales?: string[];
  /** Fallback locale used when a request omits one. Defaults to the first entry of `supportedLocales` or "en". */
  defaultLocale?: string;
  /** Groups this resource under a collapsible section in the sidebar */
  navGroup?: string;
  /** Lucide icon name for the nav group header (e.g. "ShieldCheck"). Used by the first item in the group. */
  navGroupIcon?: string;
  /** Lucide icon name for the sidebar nav item (e.g. "ShoppingBag"). Defaults to "Database". */
  icon?: string;
  /**
   * Default sort field when no sort is selected by the user.
   * Must exist on your Prisma model. Defaults to "createdAt".
   */
  defaultSortField?: string;
  /** Default sort direction. Defaults to "desc". */
  defaultSortDir?: "asc" | "desc";
  /**
   * Whether rows can be created from the admin UI/API. Default: true.
   */
  creatable?: boolean;
  /**
   * Whether rows can be edited from the admin UI/API. Default: true.
   */
  editable?: boolean;
  /**
   * Whether rows can be deleted. Default: true.
   * When false, the Delete button is hidden in CRUDTable and onDelete is not passed to CRUDPage.
   */
  deletable?: boolean;
  /**
   * When true, the router-factory only generates list + getById procedures (no create/update/delete).
   * Also hides create/edit/delete UI in CRUDResourceClient.
   */
  readOnly?: boolean;
  /**
   * Number of rows per page. Defaults to 20.
   */
  pageSize?: number;
  /**
   * Maximum number of records allowed. When the total reaches this limit,
   * the "New" button is hidden and creation is blocked.
   */
  maxRecords?: number;
  /** Optional app-level delete policies for simple relation/select references. */
  deletePolicy?: CRUDDeletePolicy[];
  /** Optional create/edit form layout. Omit to keep default single-column field order. */
  formLayout?: CRUDFormLayoutSection[];
  /** Optional server-side query hooks for complex cases. Stripped before config is sent to the client. */
  query?: CRUDQueryHooks;
  /** Optional pre-write hooks for cross-field validation. Throw to abort the write. */
  beforeCreate?: (data: Record<string, unknown>) => void | Promise<void>;
  beforeUpdate?: (id: string, data: Record<string, unknown>) => void | Promise<void>;
}

export interface CRUDExtraTab {
  /** Tab label rendered in the form tab list. */
  label: string;
  /** Names of fields this tab reads. Used for invalid-tab switching + error badges. */
  fieldNames: string[];
  /** Render the tab body. Receives the react-hook-form instance + read-only/mode/id context. */
  render: (
    form: UseFormReturn<Record<string, unknown>>,
    ctx: { readOnly?: boolean; mode: "create" | "edit"; id?: string },
  ) => React.ReactNode;
}
