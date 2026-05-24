/**
 * Example CRUD config — shows all available field types and modes.
 * Copy this file, rename it (e.g. product.ts), and update the config.
 * Then run: pnpm crud:scaffold product && pnpm db:push
 *
 * This file is intentionally NOT exported from crud/index.ts.
 * It exists only as a reference — remove or keep it, your call.
 */

// import { defineCRUD } from "@repo/crud";

// export const ExampleCRUD = defineCRUD({
//   model: "example",
//   label: "Examples",
//   navGroup: "Content",          // optional — groups this under a "Content" section in the sidebar
//   icon: "ShoppingBag",          // optional — Lucide icon name for the sidebar (default: none)
//   deletable: true,              // optional — set false to hide the Delete button (default: true)
//   readOnly: false,              // optional — set true to disable create/edit/delete entirely
//   pageSize: 20,                 // optional — rows per page (default: 20)
//   defaultSortField: "createdAt",// optional — column to sort by on first load
//   defaultSortDir: "desc",       // optional — "asc" | "desc"
//   fields: [
//     // --- Text fields ---
//     { name: "title",       type: "text",      label: "Title",       required: true, note: "Used as the page title." },
//     { name: "description", type: "textarea",  label: "Description", note: "Short summary shown in listings." },
//     { name: "body",        type: "richtext",  label: "Body" },
//     { name: "email",       type: "email",     label: "Email",       required: true, unique: true },
//     { name: "website",     type: "url",       label: "Website",     note: "Include https://" },
//     { name: "password",    type: "password",  label: "Password",    required: true },
//     { name: "color",       type: "color",     label: "Color" },
//
//     // --- Slug (auto-generated from title, must be unique) ---
//     { name: "slug", type: "text", label: "Slug", required: true, unique: true, slugFrom: "title", note: "Auto-generated from title. Edit to override." },
//
//     // --- Media ---
//     { name: "thumbnail",   type: "image",     label: "Thumbnail",   uploadUrl: "/api/upload?path=uploads/products", showInTable: false },
//     { name: "attachment",  type: "file",      label: "Attachment",  uploadUrl: "/api/upload?path=uploads/files",   accept: ".pdf,.docx", showInTable: false },
//
//     // --- Select (options required) ---
//     // Add filterable: true to show a column filter dropdown in the table.
//     {
//       name: "status",
//       type: "select",
//       label: "Status",
//       required: true,
//       filterable: true,
//       options: [
//         { label: "Draft",     value: "draft" },
//         { label: "Published", value: "published" },
//         { label: "Archived",  value: "archived" },
//       ],
//     },
//
//     // --- Dynamic select from another table ---
//     // Stores categoryId, but create/update forms, table cells, and filters can show the category name.
//     {
//       name: "categoryId",
//       type: "select",
//       label: "Category",
//       required: true,
//       filterable: true,
//       optionsFrom: {
//         model: "category",
//         valueField: "id",
//         labelField: "name",
//         where: { active: true },
//         orderBy: { name: "asc" },
//       },
//       display: {
//         table: "label",
//         filter: "select",
//       },
//     },
//
//     // --- Dynamic select with custom conditions ---
//     // Use this when options depend on session/tenant/permissions or need a more complex query.
//     {
//       name: "authorId",
//       type: "select",
//       label: "Author",
//       filterable: true,
//       optionsQuery: async ({ db, ctx }) => {
//         const authors = await db.user.findMany({
//           where: {
//             role: { name: "Author" },
//             tenantId: ctx.session.user.tenantId,
//           },
//           orderBy: { name: "asc" },
//           select: { id: true, name: true, email: true },
//         });
//
//         return authors.map((author) => ({
//           value: author.id,
//           label: author.name ?? author.email,
//         }));
//       },
//       display: {
//         table: "label",
//         filter: "select",
//       },
//     },
//
//     // --- Multicheck (array of values, stored as Postgres String[]) ---
//     {
//       name: "tags",
//       type: "multicheck",
//       label: "Tags",
//       showInTable: false,
//       options: [
//         { label: "Featured", value: "featured" },
//         { label: "New",      value: "new" },
//         { label: "Sale",     value: "sale" },
//       ],
//     },
//
//     // --- Number (Float in Prisma — supports decimals) ---
//     { name: "price",    type: "number", label: "Price ($)",  required: true },
//     { name: "quantity", type: "number", label: "Quantity",   default: 0 },
//
//     // --- Range slider (Int in Prisma) ---
//     { name: "rating", type: "range", label: "Rating", min: 1, max: 5, step: 1 },
//
//     // --- Boolean (add filterable: true for a Yes/No column filter) ---
//     { name: "published", type: "boolean", label: "Published", default: false, filterable: true },
//     { name: "featured",  type: "boolean", label: "Featured" },
//
//     // --- Date (add filterable: true for a from/to date range filter) ---
//     { name: "publishedAt", type: "date", label: "Publish Date", filterable: true },
//   ],
//   // --- Custom list query escape hatch (optional) ---
//   // Only use when field-level optionsFrom/optionsQuery are not enough,
//   // such as aggregate counts, computed columns, or joining multiple related tables.
//   query: {
//     list: async ({ db, input, baseWhere, orderBy, skip, take }) => {
//       const [items, total] = await Promise.all([
//         db.example.findMany({
//           where: baseWhere,
//           orderBy,
//           skip,
//           take,
//           include: {
//             category: { select: { name: true } },
//             author: { select: { name: true, email: true } },
//             _count: { select: { comments: true } },
//           },
//         }),
//         db.example.count({ where: baseWhere }),
//       ]);
//
//       return {
//         items: items.map((item) => ({
//           ...item,
//           categoryLabel: item.category?.name ?? null,
//           authorLabel: item.author?.name ?? item.author?.email ?? null,
//           commentCount: item._count.comments,
//         })),
//         total,
//         page: input.page,
//         pageSize: input.pageSize,
//       };
//     },
//   },
//   // --- Limit total records (optional) ---
//   // maxRecords: 10,
// });

// -----------------------------------------------------------------------
// KEY-VALUE MODE — settings-style form, no table UI.
// Scaffold creates a model with its own table (key + value columns).
// Run: pnpm crud:scaffold aboutSection && pnpm db:push
// Use tab: "..." to group fields into tabs.
// namespace: must be set on every field — used to filter rows by section.
// -----------------------------------------------------------------------

// export const AboutSectionCRUD = defineCRUD({
//   model: "aboutSection",
//   label: "About Section",
//   mode: "keyValue",              // switches UI to settings-style form
//   navGroup: "Website",           // optional sidebar group
//   icon: "FileText",              // optional Lucide icon name
//   fields: [
//     { name: "eyebrow",  type: "text",     label: "Eyebrow",   tab: "Content", namespace: "about", note: "Small label above the heading." },
//     { name: "heading",  type: "text",     label: "Heading",   tab: "Content", namespace: "about", required: true },
//     { name: "body",     type: "richtext", label: "Body",      tab: "Content", namespace: "about" },
//     { name: "ctaLabel", type: "text",     label: "CTA Label", tab: "CTA",     namespace: "about" },
//     { name: "ctaUrl",   type: "url",      label: "CTA URL",   tab: "CTA",     namespace: "about", note: "Include https://" },
//     { name: "photo",    type: "image",    label: "Photo",     tab: "Media",   namespace: "about", uploadUrl: "/api/upload?path=uploads/about" },
//   ],
// });
//
// Read from apps/web (tRPC):
//   const { data } = trpc.public.getContent.useQuery({ namespace: "aboutSection" });
//   // data = { eyebrow: "...", heading: "...", ... }
