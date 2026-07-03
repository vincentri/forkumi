# Select Modes

Source: `packages/crud/src/types.ts:180-207`, `apps/api/src/crud/example.ts`

Three strategies for populating select dropdowns:

## 1. Static Options

Fixed list of `{ label, value }` pairs. Use for enums (status, role, category with fixed taxonomy).

```ts
{
  name: "status",
  type: "select",
  label: "Status",
  required: true,
  options: [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
  ],
}
```

**Defaults**: table shows label, filter is select dropdown.

## 2. `optionsFrom` — Config-Driven Dynamic Options

Loads options from another Prisma model with a simple declarative query. Stores the FK value while showing the label in tables/forms.

```ts
{
  name: "categoryId",
  type: "select",
  label: "Category",
  optionsFrom: {
    model: "blogCategory",      // Prisma model key (lowercase)
    valueField: "id",           // submitted value
    labelField: "title",        // displayed label
    where: { status: "published" },  // optional Prisma where
    orderBy: { title: "asc" },       // optional Prisma orderBy
    searchFields: ["title"],         // fields to search on user type (default: [labelField])
    limit: 50,                       // max results (default: 50)
  },
}
```

**Defaults**: table shows **label** automatically (no `display: { table: "label" }` needed). Filter is select.

For optional relations (not required), the form includes a "None" option.

## 3. `optionsQuery` — Custom Server-Side Query

Use when options depend on session/tenant/permissions or need complex joins. Stripped before config is sent to the client — server-only.

```ts
{
  name: "authorId",
  type: "select",
  label: "Author",
  optionsQuery: async ({ db, ctx, search, selected }) => {
    const authors = await db.user.findMany({
      where: {
        role: { name: "Author" },
        tenantId: ctx.session.user.tenantId,
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    });
    return authors.map(a => ({
      value: a.id,
      label: a.name ?? a.email,
    }));
  },
  display: {
    table: "label",   // REQUIRED — defaults to "value" for optionsQuery
    filter: "select",
  },
}
```

**Defaults**: table shows **raw value** unless `display: { table: "label" }` is set.

## 4. Many-to-Many (m2m) Relation

When a record links to multiple other records via a join table. Requires `multiple: true` + `relation` + `optionsFrom`.

**Pattern** (from `apps/api/src/crud/blog.ts:35-46`):

```ts
{
  name: "tagIds",
  type: "select",
  label: "Tags",
  multiple: true,
  relation: {
    field: "tags",       // Prisma relation accessor on this model
    model: "tag",        // Target Prisma model key (lowercase)
    through: "blogTag",  // Explicit join model key (snake_case: blog_tags)
  },
  optionsFrom: {
    model: "tag",
    valueField: "id",
    labelField: "name",
    orderBy: { name: "asc" },
    searchFields: ["name"],
  },
}
```

**Scaffold generates**:
- A named join model (e.g. `BlogTag`) with `blog_id` + `tag_id` columns (snake_case convention).
- Back-relation on the `Tag` model pointing back to `Blog`.

**Write path**: values are translated to `{ set: [{id}, ...] }`. Read path uses `include`.

**Important**: Always set `through` explicitly. Prisma implicit m2m auto-generates `_BlogToTag` with `A`/`B` columns — this breaks the snake_case naming convention. See `CLAUDE.md` "Explicit join models" for details.

## display Property

```ts
display: {
  table?: "value" | "label";   // table cell rendering (default varies by mode)
  filter?: "text" | "select";  // filter widget (default: "select" for select fields)
}
```

| Mode | `display.table` default | `display.filter` default |
|---|---|---|
| Static `options` | label | select |
| `optionsFrom` | **label** (auto) | select |
| `optionsQuery` | **value** (must set `"label"` explicitly) | select |
