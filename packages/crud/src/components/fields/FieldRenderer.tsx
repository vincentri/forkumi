"use client";

import type { UseFormRegister, UseFormWatch, Control } from "react-hook-form";
import type { CRUDField, CRUDFieldMulticheck, CRUDFieldRange, CRUDFieldSelect, CRUDFieldImage, CRUDFieldFile } from "../../types";
import { BooleanField } from "./BooleanField";
import { ColorField } from "./ColorField";
import { DateTimeField } from "./DateTimeField";
import { FileUploadField } from "./FileUploadField";
import { ImageUploadField } from "./ImageUploadField";
import { MulticheckField } from "./MulticheckField";
import { RangeField } from "./RangeField";
import { SelectField } from "./SelectField";
import { TextInputField } from "./TextInputField";
import { TextareaField } from "./TextareaField";
import { RichTextEditorField } from "./RichTextEditorField";

export interface FieldRendererProps {
  field: CRUDField;
  register: UseFormRegister<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
}

/**
 * Dispatches to the right field component based on field.type.
 * Adding a new field type: create a new component in fields/, add a case here.
 */
export function FieldRenderer({ field, register, watch, control, readOnly }: FieldRendererProps) {
  switch (field.type) {
    case "textarea":
      return <TextareaField field={field} register={register} />;
    case "richtext":
      return <RichTextEditorField field={field} control={control} readOnly={readOnly} />;
    case "boolean":
      return <BooleanField field={field} control={control} />;
    case "select":
      return <SelectField field={field as CRUDFieldSelect} control={control} />;
    case "color":
      return <ColorField field={field} register={register} watch={watch} />;
    case "datetime":
      return <DateTimeField field={field} control={control} readOnly={readOnly} />;
    case "range":
      return <RangeField field={field as CRUDFieldRange} register={register} watch={watch} />;
    case "multicheck":
      return <MulticheckField field={field as CRUDFieldMulticheck} control={control} readOnly={readOnly} />;
    case "image":
      return <ImageUploadField field={field as CRUDFieldImage} control={control} readOnly={readOnly} />;
    case "file":
      return <FileUploadField field={field as CRUDFieldFile} control={control} readOnly={readOnly} />;
    default:
      // text, number, email, url, date, password
      return <TextInputField field={field} register={register} />;
  }
}
