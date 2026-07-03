"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { Button, Label, Separator, Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@repo/ui";
import { buildZodSchema } from "../schema-builder";
import { z } from "zod";
import type { CRUDConfig, CRUDExtraTab, CRUDField, CRUDFormLayoutItem, CRUDFormLayoutSection } from "../types";
import { FieldRenderer, type ModelSelectApi } from "./fields/FieldRenderer";
import { isFieldVisible, visibleFieldsForValues } from "../field-visibility";
import { toSlug } from "../util/slug";
import { ScheduleEditor, type ScheduleItem } from "./editors/ScheduleEditor";
import { GalleryEditor, type GalleryItem } from "./editors/GalleryEditor";

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

function scheduleTabLabel(field: CRUDField): string {
  return field.tab ?? field.label;
}

function galleryTabLabel(field: CRUDField): string {
  return field.tab ?? field.label;
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
  modelApi?: ModelSelectApi;
  /** Extra tabs rendered alongside field-defined tabs. Lets a resource extend the form with custom editors (e.g. inline one-to-many). */
  extraTabs?: CRUDExtraTab[];
  /** Zod object merged into the form resolver to validate extra tab fields. */
  extraSchema?: z.ZodObject<z.ZodRawShape>;
  /** Current modal mode — forwarded to extra tab render callbacks. */
  mode?: "create" | "edit";
  /** Existing row id when editing — forwarded to extra tab render callbacks. */
  rowId?: string;
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
  modelApi,
  extraTabs,
  extraSchema,
  mode,
  rowId,
}: CRUDFormProps) {
  const formFields = config.fields.filter((f) => f.showInForm !== false);
  const scheduleFields = formFields.filter((f) => f.type === "schedule");
  const galleryFieldsList = formFields.filter((f) => f.type === "gallery");
  const normalFields = formFields.filter((f) => f.type !== "schedule" && f.type !== "gallery");
  const resolvedDefaultValues = useMemo(() => {
    const fieldDefaults = Object.fromEntries(
      formFields
        .filter((field) => field.default !== undefined)
        .map((field) => [field.name, resolveFieldDefault(field)]),
    );

    const defaults: Record<string, unknown> = { ...fieldDefaults };
    if (extraTabs) {
      for (const tab of extraTabs) {
        for (const name of tab.fieldNames) {
          if (defaults[name] === undefined) defaults[name] = [];
        }
      }
    }
    for (const field of scheduleFields) {
      if (defaults[field.name] === undefined) {
        defaults[field.name] = Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          openTime: "",
          closeTime: "",
        }));
      }
    }
    for (const field of galleryFieldsList) {
      if (defaults[field.name] === undefined) {
        defaults[field.name] = [];
      }
    }

    // ponytail: Prisma returns null for unset optional strings, but the
    // schedule schema only accepts "" or HH:mm. Normalize null → "" on the
    // way in so edit mode (which seeds from `defaultValues`) doesn't choke.
    // Gallery items get position-sequenced and null-safe alt text.
    const incoming = defaultValues as Record<string, unknown> | undefined;
    const normalizedIncoming: Record<string, unknown> = {};
    if (incoming) {
      for (const [key, value] of Object.entries(incoming)) {
        const field = config.fields.find((f) => f.name === key);
        if (field?.type === "schedule" && Array.isArray(value)) {
          normalizedIncoming[key] = (value as Record<string, unknown>[]).map((item) => ({
            dayOfWeek: Number(item.dayOfWeek ?? 0),
            openTime: item.openTime == null ? "" : String(item.openTime),
            closeTime: item.closeTime == null ? "" : String(item.closeTime),
          }));
        } else if (field?.type === "gallery" && Array.isArray(value)) {
          normalizedIncoming[key] = (value as Record<string, unknown>[]).map((item, index) => ({
            url: typeof item.url === "string" ? item.url : "",
            alt: item.alt == null ? "" : String(item.alt),
            position: typeof item.position === "number" ? item.position : index,
          }));
        } else {
          normalizedIncoming[key] = value;
        }
      }
    }

    return {
      ...defaults,
      ...normalizedIncoming,
    };
  }, [defaultValues, formFields, scheduleFields, galleryFieldsList, extraTabs, config.fields]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<Record<string, unknown>>({
    resolver: async (values, context, options) => {
      const baseSchema = buildZodSchema({
        ...config,
        fields: visibleFieldsForValues(config.fields, values as Record<string, unknown>),
      });
      const schema = extraSchema ? baseSchema.and(extraSchema) : baseSchema;
      // ponytail: zodResolver's infered generic is tied to the schema's output shape,
      // which doesn't line up with our `Record<string, unknown>` form shape. Cast through
      // `never` to keep the resolver while bypassing TS' generic mismatch.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (zodResolver as any)(schema)(values, context, options) as never;
    },
    defaultValues: resolvedDefaultValues,
  });

  const fieldByName = new Map(formFields.map((field) => [field.name, field]));
  const separatorNames = useMemo(
    () => new Set(normalFields.filter((f) => f.type === "separator").map((f) => f.name)),
    [normalFields],
  );
  const hasTabs =
    normalFields.some((field) => field.tab) ||
    scheduleFields.length > 0 ||
    galleryFieldsList.length > 0 ||
    (extraTabs && extraTabs.length > 0);
  const tabs = useMemo(() => {
    if (!hasTabs) return [];
    const fieldTabs = new Set(normalFields.map(fieldTab));
    const order: string[] = [];
    for (const t of fieldTabs) order.push(t);
    for (const field of scheduleFields) {
      const label = scheduleTabLabel(field);
      if (!order.includes(label)) order.push(label);
    }
    for (const field of galleryFieldsList) {
      const label = galleryTabLabel(field);
      if (!order.includes(label)) order.push(label);
    }
    if (extraTabs) for (const t of extraTabs) if (!order.includes(t.label)) order.push(t.label);
    return order;
  }, [normalFields, scheduleFields, galleryFieldsList, extraTabs, hasTabs]);
  const extraTabByLabel = useMemo(() => {
    const map = new Map<string, CRUDExtraTab>();
    if (extraTabs) for (const t of extraTabs) map.set(t.label, t);
    return map;
  }, [extraTabs]);
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lastSourceRef = useRef<Record<string, string>>({});
  for (const slugField of slugFields) {
    const source = resolvedDefaultValues[slugField.slugFrom!];
    const slug = resolvedDefaultValues[slugField.name];
    // ponytail: existing rows follow source by default; manual edits in this form still stop it.
    if (typeof source === "string" && typeof slug === "string" && slug && !lastAutoRef.current[slugField.name]) {
      lastAutoRef.current[slugField.name] = slug;
      lastSourceRef.current[slugField.name] = source;
    }
  }
  slugFields.forEach((slugField) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sourceValue = watch(slugField.slugFrom!);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (typeof sourceValue !== "string" || !sourceValue) return;
      if (lastSourceRef.current[slugField.name] === sourceValue) return;
      lastSourceRef.current[slugField.name] = sourceValue;
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
          const field = fieldByName.get(fieldName);
          if (field && field.type !== "schedule" && field.type !== "gallery") referencedFields.add(fieldName);
        }
      }
    }
    for (const row of section.rows ?? []) {
      for (const item of row) {
        const fieldName = layoutItemField(item);
        const field = fieldByName.get(fieldName);
        if (field && field.type !== "schedule" && field.type !== "gallery") referencedFields.add(fieldName);
      }
    }
  }

  const watchedValues = watch();
  const visibleFormFields = visibleFieldsForValues(normalFields, watchedValues);
  const fieldOrder = [
    ...layoutFieldNames(config.formLayout).filter((fieldName) => fieldByName.has(fieldName)),
    ...normalFields.map((field) => field.name).filter((fieldName) => !layoutFieldNames(config.formLayout).includes(fieldName)),
  ];
  const errorCountsByTab = Object.keys(errors).reduce<Record<string, number>>((acc, fieldName) => {
    const field = fieldByName.get(fieldName);
    if (field) {
      const tab =
        field.type === "schedule"
          ? scheduleTabLabel(field)
          : field.type === "gallery"
          ? galleryTabLabel(field)
          : fieldTab(field);
      acc[tab] = (acc[tab] ?? 0) + 1;
      return acc;
    }
    if (extraTabs) {
      for (const extra of extraTabs) {
        if (extra.fieldNames.includes(fieldName)) {
          acc[extra.label] = (acc[extra.label] ?? 0) + 1;
          return acc;
        }
      }
    }
    return acc;
  }, {});

  function handleInvalidSubmit(submitErrors: FieldErrors<Record<string, unknown>>) {
    if (!hasTabs) return;
    const firstErroredField = fieldOrder.find((fieldName) => submitErrors[fieldName])
      ?? Object.keys(submitErrors).find((fieldName) => submitErrors[fieldName]);
    const field = firstErroredField ? fieldByName.get(firstErroredField) : undefined;
    let tab: string | undefined = field
      ? field.type === "schedule"
        ? scheduleTabLabel(field)
        : field.type === "gallery"
        ? galleryTabLabel(field)
        : fieldTab(field)
      : undefined;
    if (!tab && firstErroredField && extraTabs) {
      const found = extraTabs.find((t) => t.fieldNames.includes(firstErroredField));
      tab = found?.label;
    }
    if (tab) setActiveTab(tab);
  }

  function renderField(field: CRUDField) {
    if (!isFieldVisible(field, watchedValues)) return null;
    if (field.type === "schedule") return null;
    if (field.type === "gallery") return null;
    if (field.type === "separator") {
      return (
        <div key={field.name} className="pt-6">
          <Label className="text-lg font-bold text-foreground pb-3 block">{field.label}</Label>
          <Separator />
        </div>
      );
    }
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
          modelApi={modelApi}
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
    const extra = extraTabByLabel.get(tab);
    if (extra) return new Set(extra.fieldNames);
    const scheduleField = scheduleFields.find((field) => scheduleTabLabel(field) === tab);
    if (scheduleField) return new Set([scheduleField.name]);
    const galleryField = galleryFieldsList.find((field) => galleryTabLabel(field) === tab);
    if (galleryField) return new Set([galleryField.name]);
    return new Set(
      hasTabs
        ? normalFields.filter((field) => fieldTab(field) === tab).map((field) => field.name)
        : normalFields.map((field) => field.name),
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
    const extra = extraTabByLabel.get(tab);
    if (extra) {
      return (
        <div data-extra-tab={tab} className="space-y-4">
          {extra.render(
            { register, handleSubmit, watch, setValue, control, formState: { errors }, reset: () => undefined, getValues: () => ({}) } as never,
            { readOnly, mode: mode ?? "create", id: rowId },
          )}
        </div>
      );
    }

    const scheduleField = scheduleFields.find((field) => scheduleTabLabel(field) === tab);
    if (scheduleField) {
      return (
        <ScheduleEditor
          value={(watch(scheduleField.name) as ScheduleItem[] | undefined) ?? []}
          onChange={(value) => setValue(scheduleField.name, value as unknown, { shouldValidate: true, shouldDirty: true })}
          error={errors[scheduleField.name]?.message as string | undefined}
          dayLabels={scheduleField.dayLabels}
          disabled={readOnly}
        />
      );
    }

    const galleryField = galleryFieldsList.find((field) => galleryTabLabel(field) === tab);
    if (galleryField) {
      return (
        <GalleryEditor
          value={(watch(galleryField.name) as GalleryItem[] | undefined) ?? []}
          onChange={(value) => setValue(galleryField.name, value as unknown, { shouldValidate: true, shouldDirty: true })}
          error={errors[galleryField.name]?.message as string | undefined}
          uploadUrl={galleryField.uploadUrl}
          maxSizeMB={galleryField.maxSizeMB}
          disabled={readOnly}
        />
      );
    }

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
    <form
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        void handleSubmit(
        (data) => {
          const cleaned = Object.fromEntries(
            Object.entries(data).filter(([key]) => !separatorNames.has(key)),
          );
          // ponytail: UI value wins; RHF can lag behind auto-filled slug fields.
          for (const slugField of slugFields) {
            const slug = formData.get(slugField.name);
            if (typeof slug === "string") cleaned[slugField.name] = slug;
          }
          return onSubmit(cleaned);
        },
        handleInvalidSubmit,
      )(event);
      }}
      className="space-y-4"
      noValidate
    >
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
