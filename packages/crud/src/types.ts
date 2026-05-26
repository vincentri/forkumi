export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "date"
  | "email"
  | "url"
  | "select"
  | "color"
  | "password"
  | "range"
  | "multicheck"
  | "image"
  | "file";

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
}

export interface SelectDisplayOptions {
  /** In table cells, show the raw value or the matching option label. Defaults to "value". */
  table?: "value" | "label";
  /** In filter cells, render a free text input or select dropdown. Defaults to "select" for select fields. */
  filter?: "text" | "select";
}

export interface CRUDQueryContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx?: any;
}

export interface CRUDListQueryContext extends CRUDQueryContext {
  input: QueryState & { page: number; pageSize: number };
  baseWhere: Record<string, unknown>;
  orderBy: Record<string, unknown>;
  skip: number;
  take: number;
}

export interface CRUDQueryHooks {
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
  field: CRUDFieldImage | CRUDFieldFile;
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
  rows: CRUDFormLayoutItem[][];
}

export interface CRUDFormLayoutSection {
  section?: string;
  columns?: CRUDFormLayoutColumn[];
  rows?: CRUDFormLayoutItem[][];
}

export interface CRUDFieldVisibilityCondition {
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
  /** Tab group label for keyValue mode */
  tab?: string;
  /** Namespace stored as a DB column on keyValue rows — enables filtered queries */
  namespace?: string;
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

interface CRUDFieldOther extends CRUDFieldBase {
  type: Exclude<FieldType, "select" | "range" | "multicheck" | "image" | "file">;
}

export type CRUDField = CRUDFieldSelect | CRUDFieldRange | CRUDFieldMulticheck | CRUDFieldImage | CRUDFieldFile | CRUDFieldOther;

export interface QueryState {
  page: number;
  search?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string | boolean | null>;
}

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
}
