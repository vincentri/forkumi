const API_PUBLIC_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function resolveApiPublicUrl(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  if (!path.startsWith("/")) return path;
  return `${API_PUBLIC_URL.replace(/\/$/, "")}${path}`;
}
