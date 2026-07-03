# Field Types

Source: `packages/crud/src/types.ts:1-238`, `apps/api/src/crud/example.ts`

## Type Table

| Type | Prisma Type | Render Widget | Notes |
|---|---|---|---|
| `text` | `String` | Text input | Default for strings. Supports `slugFrom`, `unique`. |
| `textarea` | `String` | Multi-line textarea | For short-form content. |
| `richtext` | `String` | Rich editor (Quill/Tiptap) | For long-form content. Always `showInTable: false`. |
| `number` | `Float` | Number input | Supports decimals. |
| `range` | `Int` | Slider | `min`, `max`, `step` control range (defaults: 0, 100, 1). |
| `boolean` | `Boolean` | Toggle / Yes-No filter | Per-field Yes/No filter by default. |
| `date` | `DateTime` | Date picker | Per-field from/to date range filter. |
| `datetime` | `DateTime` | Date-time picker | Browser submits local time → converted to JS Date → stored as UTC by Prisma. `default: "now"` pre-fills with current time. |
| `email` | `String` | Email input | Zod: `z.string().email()`. |
| `url` | `String` | URL input | Zod: `z.string().url()`. |
| `color` | `String` | Color picker | Zod: `z.string().regex(/^#[0-9A-Fa-f]{6}$/)`. |
| `password` | `String` | Password input | Defaults: `showInTable: false`, `filterable: false`. Never add to `searchableFields`. |
| `multicheck` | `String[]` | Checkbox group | Array of values. Options required. `filterable: false` by default. |
| `image` | `String` | Image upload/preview | `uploadUrl` configures upload endpoint. |
| `file` | `String` | File upload | `uploadUrl` + `accept` (e.g. `".pdf,.docx"`). |
| `select` | FK `String` or `String[]` | Dropdown | See `references/select-modes.md` for static, optionsFrom, optionsQuery, and m2m patterns. |
| `schedule` | Child model (auto) | Weekly schedule editor | See below. Auto-generates a child Prisma model with day-of-week rows. |
| `gallery` | Child model (auto) | Image gallery with reorder | See below. Auto-generates a child Prisma model with `url`/`alt`/`position` rows. |

## Field Props Reference (CRUDFieldBase)

All fields share these base properties:

| Prop | Type | Default | Effect |
|---|---|---|---|
| `name` | `string` (required) | — | Prisma field name (camelCase). |
| `label` | `string` (required) | — | Display label in form + table header. |
| `type` | `FieldType` (required) | — | One of the 16 types above. |
| `required` | `boolean` | `false` | Zod: `min(1)` on create, optional on update. |
| `default` | `unknown` | — | Default value. `"now"` for datetime fields. |
| `placeholder` | `string` | — | Input placeholder text. |
| `showInTable` | `boolean` | `true` (password: `false`) | Show in table columns. |
| `showInForm` | `boolean` | `true` | Show in create/edit forms. Set `false` for computed/read-only fields. |
| `sortable` | `boolean` | `true` | Allow clicking column header to sort. |
| `tab` | `string` | — | Tab group label. Fields with same `tab` value share a form tab. |
| `namespace` | `string` | — | Required for `mode: "keyValue"` — stored as DB column for row filtering. |
| `note` | `string` | — | Helper text below the field. |
| `width` | `"full" \| "half"` | `"full"` | Form width in KeyValue mode. |
| `visibleWhen` | `CRUDFieldVisibilityCondition` | — | Conditional visibility based on another field's value. |
| `filterable` | `boolean` | `true` (password: `false`) | Server-side filtering + table column filter. |
| `unique` | `boolean` | `false` | Pre-flight uniqueness check before DB write. |
| `slugFrom` | `string` | — | Auto-generate slug from another field (e.g. `"title"`). |

## Per-Type Extensions

**Range**: `min` (0), `max` (100), `step` (1).

**Select**: `options`, `optionsFrom`, `optionsQuery`, `hasDynamicOptions`, `display` (`{ table, filter }`), `multiple`, `relation`.

**Multicheck**: `options` (required).

**Image**: `uploadUrl`, `maxSizeMB`.

**File**: `uploadUrl`, `accept`, `maxSizeMB`.

**Schedule**: `dayLabels` (optional string array, default `["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]`), `childModelName` (optional override; defaults to `{ParentModel}{PascalSingular(field.name)}`).

**Gallery**: `uploadUrl` (required — endpoint that accepts the file upload and returns the path), `maxSizeMB` (optional, default 5), `childModelName` (optional override).

### Schedule fields

A `type: "schedule"` field represents weekly operating hours. The scaffold auto-generates a child Prisma model:

```prisma
model RestaurantOperationTime {
  id           String   @id @default(cuid())
  restaurantId String   @map("restaurant_id")
  dayOfWeek    Int      @map("day_of_week")   // 0=Sun .. 6=Sat
  openTime     String?  @map("open_time")    // "HH:mm" or null = closed
  closeTime    String?  @map("close_time")
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, dayOfWeek])
  @@map("restaurant_operation_times")
}
```

Config:

```ts
{
  name: "operationTimes",
  type: "schedule",
  label: "Operation Hours",
  tab: "Schedule",
}
```

- The field renders as its own form tab (set `tab` to control the label).
- Empty open/close time means "closed" for that day.
- DB stores `dayOfWeek` as an integer index — UI shows short English labels by default.
- Nested writes are handled automatically by the router factory: `{ create: [...] }` on add, `{ deleteMany: {}, create: [...] }` on update.

### Gallery fields

A `type: "gallery"` field represents an ordered set of images belonging to the parent record. The scaffold auto-generates a child Prisma model:

```prisma
model RestaurantImage {
  id           String   @id @default(cuid())
  restaurantId String   @map("restaurant_id")
  url          String
  alt          String?  @map("alt")
  position     Int      @default(0) @map("position")
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, position])
  @@map("restaurant_images")
}
```

Config:

```ts
{
  name: "images",
  type: "gallery",
  label: "Gallery",
  tab: "Media",
  uploadUrl: "/api/upload?path=uploads/restaurants",
}
```

- `uploadUrl` is **required** — each image POSTs to this endpoint.
- Reorder via up/down arrows per card. Position is auto-sequenced on save.
- Optional `alt` text per image (accessibility/caption).
- On update, the full set is replaced (`deleteMany` + `create`) so positions stay 0..n-1.
- Removed/replaced image files are cleaned up via the existing `onAssetReplaced` hook (extended to diff gallery arrays).

## visibleWhen Condition Shape

```ts
visibleWhen: {
  field: string;       // field name to watch
  equals?: unknown;    // show when value === equals
  notEquals?: unknown; // show when value !== notEquals
  in?: unknown[];      // show when value is in array
  truthy?: boolean;    // show when value is truthy
}
```

Hidden fields are NOT validated or saved — existing values are preserved.
