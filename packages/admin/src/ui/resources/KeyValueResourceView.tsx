"use client";

import { useState } from "react";
import { KeyValuePage, type CRUDConfig } from "@repo/crud";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from "@repo/ui";
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
 * When the config declares `supportedLocales`, renders a locale switcher that
 * scopes the GET/UPDATE to a single (key, locale) row.
 */
export function KeyValueResourceView({ config, m, permissions, isProtectedRole }: Props) {
  const supportedLocales = config.supportedLocales ?? [];
  const defaultLocale = config.defaultLocale ?? supportedLocales[0] ?? "en";
  const isLocalized = supportedLocales.length > 0;

  const [locale, setLocale] = useState(defaultLocale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryInput = isLocalized ? { locale } : undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, refetch } = (m as any).get.useQuery(queryInput, {
    enabled: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateMutation = (m as any).update.useMutation();
  const canUpdate = isProtectedRole || permissions.includes(`${config.model}:update`) || permissions.includes("*:update");

  const { runtimeConfig, optionsLoading } = useDynamicOptions(config, m);

  if (isLoading || optionsLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{config.label}</h1>
        {isLocalized && supportedLocales.length > 1 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Locale</span>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger className="w-40" aria-label="Locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLocales.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <KeyValuePage
        config={runtimeConfig}
        data={data ?? {}}
        modelApi={m}
        locale={locale}
        saving={updateMutation.isPending}
        extraTabContent={config.model === "settings" ? {
          Email: (values) => (
            <SettingsEmailSecretPanel
              canUpdate={canUpdate}
              enabled={values.emailEnabled}
            />
          ),
        } : undefined}
        onSave={async (values, savedLocale) => {
          try {
            await updateMutation.mutateAsync({
              data: values,
              ...(isLocalized ? { locale: savedLocale ?? locale } : {}),
            });
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