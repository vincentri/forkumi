"use client";

import { useAdminApi } from "./AdminProvider";
import type { CRUDConfig } from "@repo/crud";
import { AlertTriangle } from "@repo/ui";
import { KeyValueResourceView } from "./resources/KeyValueResourceView";
import { CrudResourceView } from "./resources/CrudResourceView";
import type { CRUDRouter } from "./resources/types";

export interface CRUDResourceClientProps {
  config: CRUDConfig;
  permissions: string[];
  isProtectedRole: boolean;
  currentUserEmail?: string;
}

/**
 * Thin dispatcher: looks up the model's tRPC router and renders the right view
 * (keyValue for settings-style single-form resources, table+form for everything else).
 * The views live in `./resources/`.
 */
export function CRUDResourceClient({ config, permissions, isProtectedRole, currentUserEmail }: CRUDResourceClientProps) {
  const api = useAdminApi();
  const m = (api.admin as Record<string, unknown>)[config.model] as CRUDRouter | undefined;

  if (!m) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex max-w-[520px] flex-col items-center gap-4 rounded-lg border border-destructive/30 p-10 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Model not registered</h2>
          <p className="text-sm text-muted-foreground">
            The &ldquo;{config.model}&rdquo; admin router is not set up. Did you run{" "}
            <code className="font-mono">pnpm crud:scaffold {config.model}</code> and{" "}
            <code className="font-mono">pnpm db:migrate</code>?
          </p>
        </div>
      </div>
    );
  }

  if (config.mode === "keyValue") {
    return <KeyValueResourceView config={config} m={m} permissions={permissions} isProtectedRole={isProtectedRole} />;
  }

  return <CrudResourceView config={config} m={m} permissions={permissions} isProtectedRole={isProtectedRole} currentUserEmail={currentUserEmail} />;
}
