# Form Layout

Source: `packages/crud/src/types.ts:113-130`, `apps/api/src/crud/example.ts`

## Shape

```ts
formLayout: CRUDFormLayoutSection[]
```

Each section:

```ts
{
  section?: string;           // section title (visible when not inside a tab)
  columns?: CRUDFormLayoutColumn[];  // multi-column layout
  rows?: CRUDFormLayoutItem[][];     // single-column fallback
}
```

Each column:

```ts
{
  weight?: 1 | 2 | 3 | 4;   // relative width on md+ screens (default: 1)
  rows: CRUDFormLayoutItem[][];
}
```

Each row item:

```ts
string | { field: string; span?: 1 | 2 | 3 | 4 }
```

## Tab Grouping

Fields can specify `tab: "Tab name"` in the field config. The section's tab group is determined by the `tab` property of the fields within it:

- Fields without `tab` belong to the default (unnamed) tab.
- A section containing fields with `tab: "Content"` appears in the "Content" tab.
- The `section` name is the panel title; the `tab` is the tab header.
- `type: "schedule"` fields are always rendered as their own tab — set `tab` to control the label.

**All fields sharing the same tab name appear together** regardless of section grouping. Sections within a tab are ordered by their position in `formLayout`.

## Rules

1. Fields referenced in `formLayout` are rendered in the specified order.
2. Fields NOT referenced in `formLayout` are appended after all configured sections in their original field order.
3. `weight` only applies on `md+` screens. On mobile, columns collapse to single-column layout.
4. Missing field names in `rows` are silently ignored.
5. `formLayout` is optional. Omit for a single-column form with fields in original order.

## Example (from `apps/api/src/crud/blog.ts`)

```ts
formLayout: [
  {
    columns: [
      {
        weight: 3,
        rows: [
          ["title"],
          ["slug"],
          ["description"],
          ["blogCategoryId"],
          ["tagIds"],
          ["status", "publishedAt"],
        ],
      },
      {
        weight: 2,
        rows: [["image"]],
      },
    ],
  },
  {
    rows: [["content"]],  // "Content" tab via field.tab = "Content"
  },
  {
    columns: [
      {
        rows: [
          ["metaTitle"],
          ["metaDescription"],
          ["metaKeywords"],
        ],
      },
    ],
  },
],
```
