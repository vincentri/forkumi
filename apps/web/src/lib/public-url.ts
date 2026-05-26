const API_PUBLIC_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const STORAGE_PUBLIC_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export function resolveApiPublicUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  if (!path.startsWith("/")) return path;

  const baseUrl = path.startsWith("/uploads/") || path.startsWith("/defaults/")
    ? STORAGE_PUBLIC_URL ?? API_PUBLIC_URL
    : API_PUBLIC_URL;

  return `${stripTrailingSlash(baseUrl)}${path}`;
}
