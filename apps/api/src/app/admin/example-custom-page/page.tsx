// Custom admin page template.
// To add a new custom page:
//   1. Copy this file to apps/api/src/app/admin/<your-slug>/page.tsx
//   2. Add an entry in apps/api/src/lib/customLinks.ts
//
// Example customLinks.ts entry:
//   { label: "Analytics", href: "/admin/analytics", icon: "BarChart3", permissions: ["analytics:view", "analytics:create", "analytics:update", "analytics:delete"] }
import type { Metadata } from "next";
import { Button } from "@repo/ui";

export const metadata: Metadata = { title: "Example Page | Admin" };

export default function ExampleCustomPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Example Page</h1>
        <Button>+ New Item</Button>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Your content goes here.
      </div>
    </div>
  );
}
