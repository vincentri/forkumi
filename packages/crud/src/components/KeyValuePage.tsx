"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, Tabs, TabsList, TabsTrigger, TabsContent, cn } from "@repo/ui";
import type { CRUDConfig, CRUDField } from "../types";
import { FieldRenderer } from "./fields/FieldRenderer";
import { buildZodSchema } from "../schema-builder";

interface KeyValuePageProps {
  config: CRUDConfig;
  data: Record<string, string>;
  onSave: (data: Record<string, string>) => void | Promise<void>;
  saving?: boolean;
}

export function KeyValuePage({ config, data, onSave, saving }: KeyValuePageProps) {
  const fields = config.fields.filter((f) => f.showInForm !== false);
  const hasTabs = fields.some((f) => (f as CRUDField & { tab?: string }).tab);

  const tabMap = useMemo(() => {
    if (!hasTabs) return {};
    return fields.reduce<Record<string, CRUDField[]>>((acc, f) => {
      const tab = (f as CRUDField & { tab?: string }).tab ?? "General";
      acc[tab] = acc[tab] ? [...acc[tab], f] : [f];
      return acc;
    }, {});
  }, [fields, hasTabs]);

  const tabs = Object.keys(tabMap);
  const [activeTab, setActiveTab] = useState(tabs[0] ?? "");

  // Schema scoped to the active tab's fields only (or all fields when no tabs)
  const activeFields = hasTabs ? (tabMap[activeTab] ?? []) : fields;
  const schema = useMemo(
    () => buildZodSchema({ ...config, fields: activeFields }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, hasTabs],
  );

  const { register, watch, control, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  useEffect(() => {
    reset(data);
  }, [data, reset]);

  // When tab changes, re-trigger resolver by resetting with current values
  const watchedValues = watch();
  useEffect(() => {
    reset(watchedValues, { keepValues: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function onSubmit(values: Record<string, unknown>) {
    // Only persist the active tab's fields
    const tabFieldNames = new Set(activeFields.map((f) => f.name));
    const filtered = Object.fromEntries(
      Object.entries(values)
        .filter(([k]) => tabFieldNames.has(k))
        .map(([k, v]) => [k, v == null ? "" : String(v)]),
    ) as Record<string, string>;
    onSave(filtered);
  }

  if (hasTabs) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t} value={t} className="pt-4">
              <FieldList
                fields={tabMap[t]}
                register={register}
                watch={watch}
                control={control}
                errors={t === activeTab ? errors : {}}
              />
            </TabsContent>
          ))}
        </Tabs>
        <div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <FieldList fields={fields} register={register} watch={watch} control={control} errors={errors} />
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function FieldList({ fields, register, watch, control, errors }: {
  fields: CRUDField[];
  register: ReturnType<typeof useForm>["register"];
  watch: ReturnType<typeof useForm>["watch"];
  control: ReturnType<typeof useForm>["control"];
  errors: Record<string, { message?: string } | undefined>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field) => {
        const errorMessage = errors[field.name]?.message as string | undefined;
        return (
          <div
            key={field.name}
            className={cn("space-y-1.5", field.width === "half" ? "md:col-span-1" : "md:col-span-2")}
          >
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <FieldRenderer
              field={field}
              register={register as any}
              watch={watch as any}
              control={control as any}
            />
            {field.note && <p className="text-xs text-muted-foreground">{field.note}</p>}
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          </div>
        );
      })}
    </div>
  );
}
