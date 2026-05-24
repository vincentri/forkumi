"use client";

import { useMemo, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Label, cn } from "@repo/ui";
import { buildZodSchema } from "../schema-builder";
import type { CRUDConfig, CRUDField, CRUDFormLayoutItem } from "../types";
import { FieldRenderer } from "./fields/FieldRenderer";

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
  const schema = useMemo(() => buildZodSchema(config), [config]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as Record<string, unknown>,
  });

  const formFields = config.fields.filter((f) => f.showInForm !== false);
  const fieldByName = new Map(formFields.map((field) => [field.name, field]));

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

  function renderField(field: CRUDField) {
    const errorMessage = errors[field.name]?.message as string | undefined;
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
  const unreferencedFields = hasLayout
    ? formFields.filter((field) => !referencedFields.has(field.name))
    : [];

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4" noValidate>
      {!hasLayout && formFields.map(renderField)}

      {hasLayout && config.formLayout!.map((section, sectionIndex) => (
        <section key={`${section.section ?? "section"}-${sectionIndex}`} data-layout-section className="space-y-4">
          {section.section && (
            <div className="border-b pb-2">
              <h3 className="text-sm font-medium text-foreground">{section.section}</h3>
            </div>
          )}

          {section.columns && section.columns.length > 0 ? (
            <div data-layout-columns className={cn("grid grid-cols-1 gap-4", GRID_COLS[Math.min(4, Math.max(1, section.columns.length))])}>
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
      ))}

      {hasLayout && unreferencedFields.length > 0 && (
        <div data-layout-unreferenced className="space-y-4">
          {unreferencedFields.map(renderField)}
        </div>
      )}

      {!readOnly && (
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      )}
    </form>
  );
}
