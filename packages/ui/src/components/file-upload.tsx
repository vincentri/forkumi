"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface FileUploadProps {
  value?: string | null;
  uploadUrl?: string;
  fieldName?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ value, uploadUrl = "/api/upload", fieldName = "file", accept, maxSizeMB = 5, disabled, onChange, onRemove, className }, ref) => {
    const [uploading, setUploading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const filename = value ? value.split("/").pop() : null;

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMB} MB.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append(fieldName, file);
        const res = await fetch(uploadUrl, { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        onChange?.(json.url);
      } catch (err) {
        setError((err as Error)?.message ?? "Upload failed");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <div className="flex items-center gap-3">
          {value && filename ? (
            <>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 truncate max-w-[240px]"
              >
                {filename}
              </a>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-8 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Replace"}
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={disabled || uploading}
                  className="inline-flex items-center justify-center rounded-md px-3 h-8 text-xs font-medium text-destructive hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload file"}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
