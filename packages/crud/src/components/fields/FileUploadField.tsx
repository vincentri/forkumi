"use client";

import { useController, type Control } from "react-hook-form";
import { FileUpload } from "@repo/ui";
import type { CRUDFieldFile } from "../../types";

interface FileUploadFieldProps {
  field: CRUDFieldFile;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
}

export function FileUploadField({ field, control, readOnly }: FileUploadFieldProps) {
  const { field: formField } = useController({ name: field.name, control });

  return (
    <FileUpload
      value={(formField.value as string) || null}
      uploadUrl={field.uploadUrl}
      accept={field.accept}
      maxSizeMB={field.maxSizeMB}
      disabled={readOnly}
      onChange={(url) => formField.onChange(url)}
      onRemove={() => formField.onChange(null)}
    />
  );
}
