/**
 * Example CRUD config — shows all available field types and modes.
 * Copy this file, rename it (e.g. product.ts), and update the config.
 * Then run: pnpm crud:scaffold product
 *
 * This file is intentionally NOT exported from crud/index.ts.
 * It exists only as a reference — remove or keep it, your call.
 */

import { TRPCError } from "@trpc/server";
import { defineCRUD } from "@repo/crud";

// ---------------------------------------------------------------------------
// CRUD MODE — full table UI with create/edit/delete.
// ---------------------------------------------------------------------------

export const ExampleCRUD = defineCRUD({
  model: "example",
  label: "Examples",
  navGroup: "Content",          // optional — groups this under a "Content" section in the sidebar
  icon: "ShoppingBag",          // optional — Lucide icon name for the sidebar (default: none)
  deletable: true,              // optional — set false to hide the Delete button (default: true)
  readOnly: false,              // optional — set true to disable create/edit/delete entirely
  pageSize: 20,                 // optional — rows per page (default: 20)
  defaultSortField: "createdAt",// optional — column to sort by on first load
  defaultSortDir: "desc",       // optional — "asc" | "desc"

  // --- Create/Edit form layout and tabs (optional) ---
  // Omit formLayout to keep the default single-column form.
  // Add `tab: "Tab name"` to fields below to split normal CRUD create/edit forms into tabs.
  // CRUD tabs share one form state and validate the full record before saving.
  // If an error is in another tab, the form switches to that tab and marks the tab with an error count.
  // Layout references field names from fields[] below. Missing field names are ignored.
  // Fields not referenced here are appended after the configured sections in their original order.
  formLayout: [
    {
      // Fields without `tab` belong to the "General" tab.
      section: "General",
      columns: [
        {
          // Optional: relative column width. Here left:right is 3:2 on md+ screens.
          weight: 3,
          rows: [
            ["slug"],
            ["title", "tags"],
          ],
        },
        {
          weight: 2,
          rows: [["categoryId"]],
        },
      ],
    },
    {
      section: "Content",
      // This section only appears in the "Content" tab because `body` has tab: "Content".
      rows: [
        ["body"],
      ],
    },
    {
      section: "SEO",
      // This section only appears in the "SEO" tab because these fields have tab: "SEO".
      rows: [
        ["description"],
        ["metaTitle"],
        ["metaKeywords"],
      ],
    },
  ],

  // --- Delete policies for related records (optional) ---
  // Use when another CRUD/table stores this record's id in a field.
  // onDelete: "restrict" blocks deletion while related rows exist.
  // onDelete: "setNull" clears the referencing field before deletion.
  // onDelete: "setValue" moves related rows to a fallback id/value before deletion.
  // onDelete: "ignore" leaves existing values untouched.
  // Important: align this with Prisma relation behavior.
  // - To block category deletion while posts use it, use deletePolicy restrict
  //   and avoid `onDelete: SetNull` on the Prisma relation.
  // - To allow deletion and clear references, use Prisma `onDelete: SetNull`
  //   or deletePolicy setNull.
  deletePolicy: [
    {
      referencingModel: "post",
      referencingField: "categoryId",
      onDelete: "restrict",
      message: "Cannot delete this category while posts are using it.",
    },
    // { referencingModel: "post", referencingField: "categoryId", onDelete: "setNull" },
    // { referencingModel: "post", referencingField: "categoryId", onDelete: "setValue", value: "fallback_category_id" },
    // { referencingModel: "post", referencingField: "categoryId", onDelete: "ignore" },
  ],

  fields: [
    // --- Text fields ---
    // Fields are filterable by default. Set filterable: false to hide the table filter and block server filtering.
    { name: "title", type: "text", label: "Title", required: true, note: "Used as the page title." },
    { name: "description", type: "textarea", label: "Meta Description", tab: "SEO", showInTable: false, note: "Short summary shown in listings." },
    { name: "metaTitle", type: "text", label: "Meta Title", tab: "SEO", showInTable: false },
    { name: "metaKeywords", type: "text", label: "Meta Keywords", tab: "SEO", showInTable: false },
    { name: "body", type: "richtext", label: "Body", tab: "Content", filterable: false },
    { name: "email", type: "email", label: "Email", required: true, unique: true },
    { name: "website", type: "url", label: "Website", note: "Include https://" },
    { name: "password", type: "password", label: "Password", required: true },
    { name: "color", type: "color", label: "Color" },

    // --- Slug (auto-generated from title, must be unique) ---
    { name: "slug", type: "text", label: "Slug", required: true, unique: true, slugFrom: "title", note: "Auto-generated from title. Edit to override." },

    // --- Media ---
    { name: "thumbnail", type: "image", label: "Thumbnail", uploadUrl: "/api/upload?path=uploads/products", showInTable: false },
    { name: "attachment", type: "file", label: "Attachment", uploadUrl: "/api/upload?path=uploads/files", accept: ".pdf,.docx", showInTable: false },

    // --- Select (static options) ---
    // Select fields show a per-field dropdown filter by default.
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    },

    // --- Dynamic select from another table (optionsFrom) ---
    // Stores categoryId, while create/update forms, table cells, and filters show the category label.
    // optionsFrom selects show labels in tables by default — no display.table needed.
    // Add `display: { table: "value" }` to show the raw value instead.
    // For optional relations, leave `required` off. The form will include a "None" option.
    {
      name: "categoryId",
      type: "select",
      label: "Category",
      optionsFrom: {
        model: "category",
        valueField: "id",
        labelField: "name",
        where: { active: true },
        orderBy: { name: "asc" },
      },
      display: {
        filter: "select",
      },
    },

    // --- Dynamic select with custom conditions (optionsQuery) ---
    // Use this when options depend on session/tenant/permissions or need a more complex query.
    // optionsQuery fields still need display.table = "label" to show labels in tables.
    {
      name: "authorId",
      type: "select",
      label: "Author",
      optionsQuery: async ({ db, ctx }) => {
        const authors = await db.user.findMany({
          where: {
            role: { name: "Author" },
            tenantId: ctx.session.user.tenantId,
          },
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true },
        });

        return authors.map((author: { id: string; name: string | null; email: string }) => ({
          value: author.id,
          label: author.name ?? author.email,
        }));
      },
      display: {
        table: "label",
        filter: "select",
      },
    },

    // --- Multicheck (array of values, stored as Postgres String[]) ---
    {
      name: "tags",
      type: "multicheck",
      label: "Tags",
      showInTable: false,
      options: [
        { label: "Featured", value: "featured" },
        { label: "New", value: "new" },
        { label: "Sale", value: "sale" },
      ],
    },

    // --- Number (Float in Prisma — supports decimals) ---
    { name: "price", type: "number", label: "Price ($)", required: true },
    { name: "quantity", type: "number", label: "Quantity", default: 0 },

    // --- Range slider (Int in Prisma) ---
    { name: "rating", type: "range", label: "Rating", min: 1, max: 5, step: 1 },

    // --- Boolean (shows a per-field Yes/No filter by default) ---
    { name: "published", type: "boolean", label: "Published", default: false },
    { name: "featured", type: "boolean", label: "Featured" },

    // --- Date / datetime (show a per-field from/to date range filter by default) ---
    { name: "publishedAt", type: "date", label: "Publish Date" },
    // `datetime` renders a date-time picker. The browser submits local time,
    // which is converted to a JS Date and stored by Prisma as UTC.
    // `default: "now"` pre-fills create forms with the current date/time.
    { name: "scheduledAt", type: "datetime", label: "Scheduled At", default: "now" },

    // --- Schedule (weekly operation hours) ---
    // Scaffold auto-generates a child Prisma model named `ExampleOperationTime`
    // with dayOfWeek (0-6), openTime, closeTime, and a unique [parentId, dayOfWeek] constraint.
    // Renders as its own tab with the reusable ScheduleEditor.
    // Leave both open/close empty to mark a day as closed.
    { name: "operationTimes", type: "schedule", label: "Operation Hours", tab: "Hours" },
    // Override day labels (defaults to short English Sun-Sat):
    // { name: "operationTimes", type: "schedule", label: "Jam Operasional", tab: "Hours",
    //   dayLabels: ["Min","Sen","Sel","Rab","Kam","Jum","Sab"] },
    // Override the auto-derived child model name:
    // { name: "operationTimes", type: "schedule", label: "Hours", tab: "Hours",
    //   childModelName: "ExampleOpeningHour" },

    // --- Gallery (ordered image set, one-to-many in own table) ---
    // Scaffold auto-generates a child Prisma model named `ExampleImage` with
    // url, alt, position, and a unique [parentId, position] constraint.
    // Renders as its own tab with the reusable GalleryEditor (up/down reorder,
    // alt text, upload via uploadUrl). Position is auto-sequenced on save.
    // Removed images are cleaned up via the existing onAssetReplaced hook.
    { name: "images", type: "gallery", label: "Gallery", tab: "Media", uploadUrl: "/api/upload?path=uploads/examples" },
    // { name: "images", type: "gallery", label: "Gallery", tab: "Media",
    //   uploadUrl: "/api/upload?path=uploads/examples", maxSizeMB: 10,
    //   childModelName: "ExamplePhoto" },
  ],

  // --- Custom list query escape hatch (optional) ---
  // Only use when field-level optionsFrom/optionsQuery are not enough,
  // such as aggregate counts, computed columns, or joining multiple related tables.
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // --- Limit total records (optional) ---
  // maxRecords: 10,

  // --- Pre-write validation hooks (optional) ---
  // Run before Prisma create/update. Throw TRPCError to abort the write.
  // Replaces the need for a custom tRPC router override in most cases.
  // beforeCreate: (data) => {
  //   if (data.price != null && data.price < 0) {
  //     throw new TRPCError({ code: "BAD_REQUEST", message: "Price cannot be negative." });
  //   }
  // },
  // beforeUpdate: (id, data) => {
  //   if (data.price != null && data.price < 0) {
  //     throw new TRPCError({ code: "BAD_REQUEST", message: "Price cannot be negative." });
  //   }
  // },
});

// ---------------------------------------------------------------------------
// KEY-VALUE MODE — settings-style form, no table UI.
// Scaffold creates a model with its own table (key + value columns).
// Run: pnpm crud:scaffold aboutSection
// Use tab: "..." to group fields into tabs.
// namespace: must be set on every field — used to filter rows by section.
// visibleWhen: conditionally shows a field based on another field's current value.
// Hidden fields are not validated or saved, so provider-specific settings are preserved.
// ---------------------------------------------------------------------------

export const AboutSectionCRUD = defineCRUD({
  model: "aboutSection",
  label: "About Section",
  mode: "keyValue",              // switches UI to settings-style form
  navGroup: "Website",           // optional sidebar group
  icon: "FileText",              // optional Lucide icon name
  fields: [
    { name: "eyebrow", type: "text", label: "Eyebrow", tab: "Content", namespace: "about", note: "Small label above the heading." },
    { name: "heading", type: "text", label: "Heading", tab: "Content", namespace: "about", required: true },
    { name: "body", type: "richtext", label: "Body", tab: "Content", namespace: "about" },
    { name: "ctaLabel", type: "text", label: "CTA Label", tab: "CTA", namespace: "about" },
    { name: "ctaUrl", type: "url", label: "CTA URL", tab: "CTA", namespace: "about", note: "Include https://" },
    { name: "showBadge", type: "boolean", label: "Show Badge", tab: "CTA", namespace: "about", default: false },
    { name: "badgeText", type: "text", label: "Badge Text", tab: "CTA", namespace: "about", visibleWhen: { field: "showBadge", equals: true } },
    { name: "photo", type: "image", label: "Photo", tab: "Media", namespace: "about", uploadUrl: "/api/upload?path=uploads/about" },
  ],
});

// Read from apps/web (tRPC):
//   const { data } = trpc.public.getContent.useQuery({ namespace: "aboutSection" });
//   // data = { eyebrow: "...", heading: "...", ... }
