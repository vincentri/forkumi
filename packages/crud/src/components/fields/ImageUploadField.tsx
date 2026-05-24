"use client";

import { useController, type Control } from "react-hook-form";
import { ImageUpload } from "@repo/ui";
import type { CRUDFieldImage } from "../../types";

interface ImageUploadFieldProps {
  field: CRUDFieldImage;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
}

export function ImageUploadField({ field, control, readOnly }: ImageUploadFieldProps) {
  const { field: formField } = useController({ name: field.name, control });

  return (
    <ImageUpload
      value={(formField.value as string) || null}
      uploadUrl={field.uploadUrl}
      maxSizeMB={field.maxSizeMB}
      disabled={readOnly}
      onChange={(url) => formField.onChange(url)}
      onRemove={() => formField.onChange(null)}
    />
  );
}
