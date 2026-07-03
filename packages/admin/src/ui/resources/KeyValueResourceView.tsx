"use client";

import { KeyValuePage, type CRUDConfig } from "@repo/crud";
import { toast } from "@repo/ui";
import { getErrorMessage } from "../lib/getErrorMessage";
import { SettingsEmailSecretPanel } from "./SettingsEmailSecretPanel";
import { useDynamicOptions } from "./useDynamicOptions";
import type { CRUDRouter } from "./types";

interface Props {
  config: CRUDConfig;
  m: CRUDRouter;
  permissions: string[];
  isProtectedRole: boolean;
}

/**
 * Renders a keyValue-mode resource (e.g. Settings) — single form, no table.
 * For Settings specifically, injects an extra "Email" tab with the email provider config.
 */
export function KeyValueResourceView({ config, m, permissions, isProtectedRole }: Props) {
  // The keyValue router only has `get` and `update` (not `list`).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, refetch } = (m as any).get.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateMutation = (m as any).update.useMutation();
  const canUpdate = isProtectedRole || permissions.includes(`${config.model}:update`) || permissions.includes("*:update");

  const { runtimeConfig, optionsLoading } = useDynamicOptions(config, m);

  if (isLoading || optionsLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{config.label}</h1>
      <KeyValuePage
        config={runtimeConfig}
        data={data ?? {}}
        modelApi={m}
        saving={updateMutation.isPending}
        extraTabContent={config.model === "settings" ? {
          Email: (values) => (
            <SettingsEmailSecretPanel
              canUpdate={canUpdate}
              enabled={values.emailEnabled}
            />
          ),
        } : undefined}
        onSave={async (values) => {
          try {
            await updateMutation.mutateAsync({ data: values });
            await refetch();
            toast.success("Saved");
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
