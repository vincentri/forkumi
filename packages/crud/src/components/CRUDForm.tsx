"use client";

import { useMemo, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Label } from "@repo/ui";
import { buildZodSchema } from "../schema-builder";
import type { CRUDConfig } from "../types";
import { FieldRenderer } from "./fields/FieldRenderer";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4" noValidate>
      {formFields.map((field) => {
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
      })}

      {!readOnly && (
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      )}
    </form>
  );
}
