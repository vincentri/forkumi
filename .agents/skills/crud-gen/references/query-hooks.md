# Query Hooks (Escape Hatch)

Source: `packages/crud/src/types.ts:66-78`, `apps/api/src/crud/example.ts:212-242`

## When to Use

Field-level `optionsFrom` / `optionsQuery` are not enough. Use `query.list` when you need:
- Aggregate counts (e.g. `_count: { select: { comments: true } }`)
- Computed columns (e.g. `commentCount`)
- Joined label columns from multiple related tables
- Custom tenant-specific or permission-filtered queries

## Shape

```ts
query: {
  list: async ({ db, input, baseWhere, orderBy, skip, take }) => {
    // input = { page, pageSize, search, sortField, sortDir, filters }
    // baseWhere = pre-built where clause from table filters + search
    // orderBy = pre-built sort clause
    // skip/take = pagination offsets

    const [items, total] = await Promise.all([
      db.<model>.findMany({ where: baseWhere, orderBy, skip, take, include: { ... } }),
      db.<model>.count({ where: baseWhere }),
    ]);

    return {
      items: items.map(item => ({
        ...item,
        // Add computed/joined fields here
      })),
      total,
      page: input.page,
      pageSize: input.pageSize,
      // totalPages is computed automatically if omitted
    };
  },
}
```

## Example (from `apps/api/src/crud/example.ts:212-242`)

```ts
query: {
  list: async ({ db, input, baseWhere, orderBy, skip, take }) => {
    const [items, total] = await Promise.all([
      db.example.findMany({
        where: baseWhere,
        orderBy,
        skip,
        take,
        include: {
          category: { select: { name: true } },
          author: { select: { name: true, email: true } },
          _count: { select: { comments: true } },
        },
      }),
      db.example.count({ where: baseWhere }),
    ]);

    return {
      items: items.map((item: any) => ({
        ...item,
        categoryLabel: item.category?.name ?? null,
        authorLabel: item.author?.name ?? item.author?.email ?? null,
        commentCount: item._count.comments,
      })),
      total,
      page: input.page,
      pageSize: input.pageSize,
    };
  },
},
```

## Notes

- `query.list` is stripped before config is sent to the client. It runs server-side only.
- You must handle pagination (skip/take) and total count yourself.
- The return shape must match the generated list procedure: `{ items, total, page, pageSize }`.
- If you only need a few aggregate fields, prefer `optionsFrom` or `optionsQuery` — they're simpler and compose with the generated router.
