"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, Separator, Tabs, TabsList, TabsTrigger, TabsContent, cn } from "@repo/ui";
import type { CRUDConfig, CRUDField } from "../types";
import { FieldRenderer, type ModelSelectApi } from "./fields/FieldRenderer";
import { buildZodSchema } from "../schema-builder";
import { visibleFieldsForValues } from "../field-visibility";

interface KeyValuePageProps {
  config: CRUDConfig;
  data: Record<string, string>;
  onSave: (data: Record<string, string>) => void | Promise<void>;
  saving?: boolean;
  extraTabContent?: Record<string, ReactNode | ((values: Record<string, unknown>) => ReactNode)>;
  modelApi?: ModelSelectApi;
}

function normalizeDataForFields(fields: CRUDField[], data: Record<string, string>): Record<string, unknown> {
  return Object.fromEntries(
    fields
      .filter((field) => field.type !== "separator")
      .map((field) => {
        const storedValue = data[field.name];
        const value: unknown =
          (storedValue === "" || storedValue == null) && field.default !== undefined
            ? field.default
            : storedValue ?? "";
        if (field.type === "boolean") return [field.name, value === true || value === "true"];
        return [field.name, value];
      }),
  );
}

function renderExtraTabContent(
  content: ReactNode | ((values: Record<string, unknown>) => ReactNode) | undefined,
  values: Record<string, unknown>,
): ReactNode {
  return typeof content === "function" ? content(values) : content;
}

export function KeyValuePage({ config, data, onSave, saving, extraTabContent, modelApi }: KeyValuePageProps) {
  const fields = useMemo(() => config.fields.filter((f) => f.showInForm !== false), [config.fields]);
  const hasTabs = fields.some((f) => (f as CRUDField & { tab?: string }).tab);
  const defaultValues = useMemo(() => normalizeDataForFields(fields, data), [fields, data]);

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
  const { register, watch, control, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>({
    resolver: async (values, context, options) => {
      const schema = buildZodSchema({
        ...config,
        fields: visibleFieldsForValues(activeFields, values as Record<string, unknown>),
      });
      return zodResolver(schema)(values, context, options);
    },
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // When tab changes, re-trigger resolver by resetting with current values
  const watchedValues = watch();
  useEffect(() => {
    reset(watchedValues, { keepValues: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function onSubmit(values: Record<string, unknown>) {
    // Only persist the active tab's fields
    const tabFieldNames = new Set(
      visibleFieldsForValues(activeFields, values)
        .filter((f) => f.type !== "separator")
        .map((f) => f.name),
    );
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
              <div className="space-y-6">
                <FieldList
                  fields={visibleFieldsForValues(tabMap[t], watchedValues)}
                  register={register}
                  watch={watch}
                  control={control}
                  errors={t === activeTab ? errors : {}}
                  modelApi={modelApi}
                />
                {renderExtraTabContent(extraTabContent?.[t], watchedValues)}
              </div>
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
      <FieldList fields={visibleFieldsForValues(fields, watchedValues)} register={register} watch={watch} control={control} errors={errors} modelApi={modelApi} />
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function FieldList({ fields, register, watch, control, errors, modelApi }: {
  fields: CRUDField[];
  register: ReturnType<typeof useForm>["register"];
  watch: ReturnType<typeof useForm>["watch"];
  control: ReturnType<typeof useForm>["control"];
  errors: Record<string, { message?: string } | undefined>;
  modelApi?: ModelSelectApi;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field) => {
        const errorMessage = errors[field.name]?.message as string | undefined;
        if (field.type === "separator") {
          return (
            <div
              key={field.name}
              className={cn("pt-6", field.width === "half" ? "md:col-span-1" : "md:col-span-2")}
            >
              <Label className="text-lg font-bold text-foreground pb-3 block">{field.label}</Label>
              <Separator />
            </div>
          );
        }
        if (field.type === "boolean") {
          return (
            <div
              key={field.name}
              className={cn("space-y-1.5", field.width === "half" ? "md:col-span-1" : "md:col-span-2")}
            >
              <div className="flex items-center gap-3">
                <FieldRenderer
                  field={field}
                  register={register as any}
                  watch={watch as any}
                  control={control as any}
                  modelApi={modelApi}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  {field.label}
                  {field.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
              </div>
              {field.note && <p className="text-xs text-muted-foreground">{field.note}</p>}
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            </div>
          );
        }

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
              modelApi={modelApi}
            />
            {field.note && <p className="text-xs text-muted-foreground">{field.note}</p>}
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          </div>
        );
      })}
    </div>
  );
}
