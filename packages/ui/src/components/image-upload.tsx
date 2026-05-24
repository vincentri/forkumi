"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface ImageUploadProps {
  value?: string | null;
  uploadUrl?: string;
  fieldName?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

const ACCEPT_IMAGES = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";
type ImageMode = "upload" | "url";

const ImageUpload = React.forwardRef<HTMLDivElement, ImageUploadProps>(
  ({ value, uploadUrl = "/api/upload", fieldName = "file", maxSizeMB = 5, disabled, onChange, onRemove, className }, ref) => {
    const [mode, setMode] = React.useState<ImageMode>("upload");
    const [uploading, setUploading] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [brokenUrl, setBrokenUrl] = React.useState<string | null>(null);
    const [urlDraft, setUrlDraft] = React.useState(value ?? "");
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      setBrokenUrl(null);
      setUrlDraft(value ?? "");
    }, [value]);

    const resolvedValue = value === brokenUrl ? null : value;
    const displayUrl = previewUrl ?? resolvedValue;

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMB} MB.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append(fieldName, file);
        const res = await fetch(uploadUrl, { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        setPreviewUrl(null);
        onChange?.(json.url);
      } catch (err) {
        setError((err as Error)?.message ?? "Upload failed");
        setPreviewUrl(null);
      } finally {
        setUploading(false);
        URL.revokeObjectURL(objectUrl);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }

    function handleModeChange(nextMode: ImageMode) {
      setMode(nextMode);
      setError(null);
      if (nextMode === "url") {
        setUrlDraft(value ?? "");
      }
    }

    function handleApplyUrl() {
      const nextUrl = urlDraft.trim();
      if (!nextUrl) {
        setError("Enter an image URL or path.");
        return;
      }
      setError(null);
      setBrokenUrl(null);
      setPreviewUrl(null);
      onChange?.(nextUrl);
    }

    function handleRemove() {
      setError(null);
      setPreviewUrl(null);
      setBrokenUrl(null);
      setUrlDraft("");
      onRemove?.();
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <div className="rounded-lg border border-border p-5 space-y-4">
          {!disabled && (
            <div className="inline-flex rounded-md border border-input bg-muted p-0.5">
              {(["upload", "url"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleModeChange(item)}
                  disabled={uploading}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded px-3 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
                    mode === item
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item === "upload" ? "Upload" : "Image URL"}
                </button>
              ))}
            </div>
          )}

          {displayUrl ? (
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md border border-border overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayUrl} alt="" className="h-full w-full object-contain" onError={() => setBrokenUrl(displayUrl ?? null)} />
              </div>
              {!disabled && (
                <div className="flex gap-2">
                  {mode === "upload" && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-8 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Change"}
                    </button>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={uploading}
                      className="inline-flex items-center justify-center rounded-md px-3 h-8 text-xs font-medium text-destructive hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-md border border-dashed border-border bg-muted flex items-center justify-center">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              {!disabled && (
                <div className="space-y-1">
                  {mode === "upload" && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">No image set</p>
                </div>
              )}
            </div>
          )}
          {!disabled && mode === "url" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://example.com/image.png or /uploads/image.png"
                disabled={uploading}
                className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={uploading}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_IMAGES}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </div>
    );
  }
);
ImageUpload.displayName = "ImageUpload";

export { ImageUpload };
