import type { AdminNavLink } from "@repo/admin";

// Register custom admin pages here. Each entry adds a sidebar link and
// optionally gates visibility + Role editor permissions.
//
// Steps to add a page:
//   1. Create apps/api/src/app/admin/<slug>/page.tsx
//      (copy from apps/api/src/app/admin/example-custom-page/page.tsx)
//   2. Add an entry below.
//
// Fields:
//   label       — sidebar text
//   href        — URL path, e.g. "/admin/analytics"
//   icon        — Lucide icon name, see https://lucide.dev/icons
//   navGroup    — optional collapsible group in the sidebar
//   permissions — optional list of permission strings (e.g. ["analytics:view"])
//                 First entry controls nav visibility for non-admin users.
//                 All entries appear as assignable permissions in the Role editor.
//
// Examples:
// { label: "Analytics",  href: "/admin/analytics",  icon: "BarChart3",   permissions: ["analytics:view"] },
// { label: "Blog",       href: "/admin/blog",        icon: "BookOpen",    permissions: ["blog:view", "blog:create", "blog:update", "blog:delete"], navGroup: "Content" },
// { label: "Audit Log",  href: "/admin/audit-log",   icon: "ClipboardList" },

export const customLinks: AdminNavLink[] = [
  // Example custom page — remove or replace with your own.
  {
    label: "Example Page",
    href: "/admin/example-custom-page",
    icon: "FileText",
    permissions: [
      "example:view",
    ],
  },
];
