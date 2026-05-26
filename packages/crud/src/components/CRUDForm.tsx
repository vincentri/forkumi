"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { Button, Label, Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@repo/ui";
import { buildZodSchema } from "../schema-builder";
import type { CRUDConfig, CRUDField, CRUDFormLayoutItem, CRUDFormLayoutSection } from "../types";
import { FieldRenderer } from "./fields/FieldRenderer";
import { isFieldVisible, visibleFieldsForValues } from "../field-visibility";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GRID_COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const COL_SPANS: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};

function layoutItemField(item: CRUDFormLayoutItem): string {
  return typeof item === "string" ? item : item.field;
}

function layoutItemSpan(item: CRUDFormLayoutItem): number {
  return typeof item === "string" ? 1 : item.span ?? 1;
}

function rowColumnCount(row: CRUDFormLayoutItem[]): number {
  return Math.min(4, Math.max(1, row.reduce((total, item) => total + layoutItemSpan(item), 0)));
}

function columnTemplate(columns: NonNullable<CRUDConfig["formLayout"]>[number]["columns"]): string | undefined {
  if (!columns?.some((column) => column.weight !== undefined)) return undefined;
  return columns.map((column) => `minmax(0, ${column.weight ?? 1}fr)`).join(" ");
}

function fieldTab(field: CRUDField): string {
  return field.tab ?? "General";
}

function layoutFieldNames(layout: CRUDFormLayoutSection[] | undefined): string[] {
  const names: string[] = [];
  for (const section of layout ?? []) {
    for (const column of section.columns ?? []) {
      for (const row of column.rows) {
        for (const item of row) names.push(layoutItemField(item));
      }
    }
    for (const row of section.rows ?? []) {
      for (const item of row) names.push(layoutItemField(item));
    }
  }
  return names;
}

function filterLayoutByFields(layout: CRUDFormLayoutSection[] | undefined, allowedFields: Set<string>): CRUDFormLayoutSection[] {
  return (layout ?? [])
    .map((section) => ({
      ...section,
      columns: section.columns
        ?.map((column) => ({
          ...column,
          rows: column.rows
            .map((row) => row.filter((item) => allowedFields.has(layoutItemField(item))))
            .filter((row) => row.length > 0),
        }))
        .filter((column) => column.rows.length > 0),
      rows: section.rows
        ?.map((row) => row.filter((item) => allowedFields.has(layoutItemField(item))))
        .filter((row) => row.length > 0),
    }))
    .filter((section) => (section.columns?.length ?? 0) > 0 || (section.rows?.length ?? 0) > 0);
}

function resolveFieldDefault(field: CRUDField): unknown {
  if (field.type === "datetime" && field.default === "now") return new Date();
  return field.default;
}

interface CRUDFormProps {
  config: CRUDConfig;
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  /** When true, all fields are read-only and the submit button is hidden */
  readOnly?: boolean;
}

/**
 * Auto-generated form from a CRUDConfig.
 * Field rendering is delegated to FieldRenderer → fields/*.tsx.
 */
export function CRUDForm({
  config,
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "Save",
  readOnly,
}: CRUDFormProps) {
  const formFields = config.fields.filter((f) => f.showInForm !== false);
  const resolvedDefaultValues = useMemo(() => {
    const fieldDefaults = Object.fromEntries(
      formFields
        .filter((field) => field.default !== undefined)
        .map((field) => [field.name, resolveFieldDefault(field)]),
    );

    return {
      ...fieldDefaults,
      ...(defaultValues as Record<string, unknown> | undefined),
    };
  }, [defaultValues, formFields]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm({
    resolver: async (values, context, options) => {
      const schema = buildZodSchema({
        ...config,
        fields: visibleFieldsForValues(config.fields, values as Record<string, unknown>),
      });
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: resolvedDefaultValues,
  });

  const fieldByName = new Map(formFields.map((field) => [field.name, field]));
  const hasTabs = formFields.some((field) => field.tab);
  const tabs = useMemo(
    () => hasTabs ? Array.from(new Set(formFields.map(fieldTab))) : [],
    [formFields, hasTabs],
  );
  const [activeTab, setActiveTab] = useState(tabs[0] ?? "");

  useEffect(() => {
    if (!hasTabs) return;
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0] ?? "");
  }, [activeTab, hasTabs, tabs]);

  // Auto-generate slug fields from their source field.
  // lastAutoRef tracks the last value we wrote — if the slug still matches it (or is empty), keep auto-filling.
  const slugFields = formFields.filter((f) => f.slugFrom);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lastAutoRef = useRef<Record<string, string>>({});
  slugFields.forEach((slugField) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sourceValue = watch(slugField.slugFrom!);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (typeof sourceValue !== "string" || !sourceValue) return;
      const current = (watch(slugField.name) as string | undefined) ?? "";
      const lastAuto = lastAutoRef.current[slugField.name] ?? "";
      // Only auto-fill if slug is empty or still equals the last value we set
      if (current !== "" && current !== lastAuto) return;
      const derived = toSlug(sourceValue);
      lastAutoRef.current[slugField.name] = derived;
      setValue(slugField.name, derived, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceValue]);
  });

  const referencedFields = new Set<string>();
  for (const section of config.formLayout ?? []) {
    for (const column of section.columns ?? []) {
      for (const row of column.rows) {
        for (const item of row) {
          const fieldName = layoutItemField(item);
          if (fieldByName.has(fieldName)) referencedFields.add(fieldName);
        }
      }
    }
    for (const row of section.rows ?? []) {
      for (const item of row) {
        const fieldName = layoutItemField(item);
        if (fieldByName.has(fieldName)) referencedFields.add(fieldName);
      }
    }
  }

  const watchedValues = watch();
  const visibleFormFields = visibleFieldsForValues(formFields, watchedValues);
  const fieldOrder = [
    ...layoutFieldNames(config.formLayout).filter((fieldName) => fieldByName.has(fieldName)),
    ...formFields.map((field) => field.name).filter((fieldName) => !layoutFieldNames(config.formLayout).includes(fieldName)),
  ];
  const errorCountsByTab = Object.keys(errors).reduce<Record<string, number>>((acc, fieldName) => {
    const field = fieldByName.get(fieldName);
    if (!field) return acc;
    const tab = fieldTab(field);
    acc[tab] = (acc[tab] ?? 0) + 1;
    return acc;
  }, {});

  function handleInvalidSubmit(submitErrors: FieldErrors<Record<string, unknown>>) {
    if (!hasTabs) return;
    const firstErroredField = fieldOrder.find((fieldName) => submitErrors[fieldName]);
    const field = firstErroredField ? fieldByName.get(firstErroredField) : undefined;
    const tab = field ? fieldTab(field) : undefined;
    if (tab) setActiveTab(tab);
  }

  function renderField(field: CRUDField) {
    if (!isFieldVisible(field, watchedValues)) return null;
    const errorMessage = errors[field.name]?.message as string | undefined;
    if (field.type === "boolean") {
      return (
        <div key={field.name} className="space-y-1.5">
          <div className="flex items-center gap-3">
            <FieldRenderer
              field={field}
              register={register}
              watch={watch}
              control={control}
              readOnly={readOnly}
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
      <div key={field.name} className="space-y-1.5">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <FieldRenderer
          field={field}
          register={register}
          watch={watch}
          control={control}
          readOnly={readOnly}
        />
        {field.note && <p className="text-xs text-muted-foreground">{field.note}</p>}
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </div>
    );
  }

  function renderLayoutRow(row: CRUDFormLayoutItem[], key: string) {
    const items = row
      .map((item) => {
        const field = fieldByName.get(layoutItemField(item));
        if (!field) return null;
        return { item, field };
      })
      .filter((entry): entry is { item: CRUDFormLayoutItem; field: CRUDField } => entry !== null);

    if (items.length === 0) return null;

    return (
      <div key={key} data-layout-row className={cn("grid grid-cols-1 gap-4", GRID_COLS[rowColumnCount(row)])}>
        {items.map(({ item, field }) => (
          <div key={field.name} className={COL_SPANS[layoutItemSpan(item)]}>
            {renderField(field)}
          </div>
        ))}
      </div>
    );
  }

  const hasLayout = !!config.formLayout?.length;
  function fieldNamesForTab(tab: string): Set<string> {
    return new Set(
      hasTabs
        ? formFields.filter((field) => fieldTab(field) === tab).map((field) => field.name)
        : formFields.map((field) => field.name),
    );
  }

  function renderConfiguredLayout(layout: CRUDFormLayoutSection[]) {
    return layout.map((section, sectionIndex) => (
      <section key={`${section.section ?? "section"}-${sectionIndex}`} data-layout-section className="space-y-4">
        {section.section && (
          <div className="border-b pb-2">
            <h3 className="text-sm font-medium text-foreground">{section.section}</h3>
          </div>
        )}

        {section.columns && section.columns.length > 0 ? (
          <div
            data-layout-columns
            className={cn(
              "grid grid-cols-1 gap-4",
              columnTemplate(section.columns)
                ? "md:[grid-template-columns:var(--crud-form-columns)]"
                : GRID_COLS[Math.min(4, Math.max(1, section.columns.length))],
            )}
            style={columnTemplate(section.columns)
              ? ({ "--crud-form-columns": columnTemplate(section.columns) } as CSSProperties)
              : undefined}
          >
            {section.columns.map((column, columnIndex) => (
              <div key={columnIndex} data-layout-column className="space-y-4">
                {column.rows.map((row, rowIndex) => renderLayoutRow(row, `${sectionIndex}-${columnIndex}-${rowIndex}`))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(section.rows ?? []).map((row, rowIndex) => renderLayoutRow(row, `${sectionIndex}-${rowIndex}`))}
          </div>
        )}
      </section>
    ));
  }

  function renderFormBody(tab = activeTab) {
    const tabFieldNames = fieldNamesForTab(tab);
    const visibleTabFields = visibleFormFields.filter((field) => tabFieldNames.has(field.name));
    const tabLayout = hasTabs ? filterLayoutByFields(config.formLayout, tabFieldNames) : config.formLayout;
    const unreferencedFields = hasLayout
      ? visibleTabFields.filter((field) => !referencedFields.has(field.name))
      : [];

    return (
      <>
        {!hasLayout && visibleTabFields.map(renderField)}

        {hasLayout && renderConfiguredLayout(tabLayout ?? [])}

        {hasLayout && unreferencedFields.length > 0 && (
          <div data-layout-unreferenced className="space-y-4">
            {unreferencedFields.map(renderField)}
          </div>
        )}
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data), handleInvalidSubmit)} className="space-y-4" noValidate>
      {hasTabs ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start">
            {tabs.map((tab) => {
              const errorCount = errorCountsByTab[tab] ?? 0;
              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={errorCount > 0 ? "text-destructive data-[state=active]:text-destructive" : undefined}
                >
                  {tab}
                  {errorCount > 0 && <span className="ml-1">({errorCount})</span>}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
              {renderFormBody(tab)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        renderFormBody()
      )}

      {!readOnly && (
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      )}
    </form>
  );
}
