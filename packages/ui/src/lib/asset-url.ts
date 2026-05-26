const ABSOLUTE_ASSET_PATTERN = /^(https?:|data:|blob:)/;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function assetBaseUrl(path: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  if (path.startsWith("/uploads/") || path.startsWith("/defaults/")) {
    return process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? apiBase;
  }

  return apiBase;
}

export function resolveAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  if (ABSOLUTE_ASSET_PATTERN.test(value)) return value;
  if (!value.startsWith("/")) return value;

  return `${stripTrailingSlash(assetBaseUrl(value))}${value}`;
}

export function isManagedAssetPath(value: string): boolean {
  return value.startsWith("/uploads/") || value.startsWith("/defaults/");
}
