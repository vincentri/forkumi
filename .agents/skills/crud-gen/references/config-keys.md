# CRUDConfig — Top-Level Keys

Source: `packages/crud/src/types.ts:247-305`

| Key | Type | Default | Effect |
|---|---|---|---|
| `model` | `string` (required) | — | Prisma model name, lowercase (e.g. `"product"` for model `Product`). Used as DB table key. |
| `label` | `string` (required) | — | Display label for admin UI (e.g. `"Products"`). Appears in nav sidebar and page header. |
| `mode` | `"crud" \| "keyValue"` | `"crud"` | `crud` = table + modal CRUD. `keyValue` = settings-style form, no table. |
| `navGroup` | `string` | none | Groups this resource under a collapsible sidebar section (e.g. `"Blog"`, `"Administration"`). |
| `navGroupIcon` | `string` | none | Lucide icon name for the group header. Set on the first item in the group; subsequent items in the group ignore it. |
| `icon` | `string` | `"Database"` | Lucide icon name for the sidebar nav item (e.g. `"ShoppingBag"`, `"Shield"`). |
| `defaultSortField` | `string` | `"createdAt"` | Column to sort by on first load. Must exist on the Prisma model. |
| `defaultSortDir` | `"asc" \| "desc"` | `"desc"` | Sort direction on first load. |
| `creatable` | `boolean` | `true` | When `false`, hides the "New" button and blocks the create procedure. |
| `editable` | `boolean` | `true` | When `false`, hides row edit UI and blocks the update procedure. |
| `deletable` | `boolean` | `true` | When `false`, hides the Delete button and blocks the delete procedure. |
| `readOnly` | `boolean` | `false` | Disables all write operations. Router generates only `list` + `getById`. Permission options drop to `view` only. |
| `pageSize` | `number` | `20` | Rows per page in the table view. |
| `maxRecords` | `number` | none | Hard cap on total records. When `total >= maxRecords`, "New" button hidden and creation blocked. |
| `deletePolicy` | `CRUDDeletePolicy[]` | none | App-level guards for related rows (see `references/delete-policy.md`). |
| `formLayout` | `CRUDFormLayoutSection[]` | single-column | Sections, columns, rows, tab grouping (see `references/form-layout.md`). |
| `query` | `CRUDQueryHooks` | none | `list()` escape hatch for aggregates/joins (see `references/query-hooks.md`). |
| `beforeCreate` | `(data) => void \| Promise<void>` | none | Runs before Prisma create. Throw `TRPCError` to abort. Replaces custom router overrides for cross-field validation. |
| `beforeUpdate` | `(id, data) => void \| Promise<void>` | none | Runs before Prisma update. Same as `beforeCreate`. |
| `dayLabels` (schedule fields) | `string[]` | short English Sun–Sat | Override day labels in the schedule editor. |
| `childModelName` (schedule / gallery fields) | `string` | `{Parent}{PascalSingular(name)}` | Override the auto-generated child Prisma model name. |
| `uploadUrl` (gallery fields) | `string` (required) | — | Endpoint that accepts the file upload and returns the path. |
| `maxSizeMB` (gallery fields) | `number` | `5` | Max upload size per image. |

## Notes

- `mode: "keyValue"` is mutually exclusive with table UI. Every field in KeyValue mode MUST have `namespace`.
- `readOnly` + `editable: false` have overlapping effects but different semantics: `readOnly` is a router-level constraint; `editable` is UI-only.
- Built-in admin resources (`UserCRUD`, `createRoleCRUD`, `SettingsCRUD`) use `@repo/admin` factories — do not redefine them in `apps/api/src/crud/`.
