import { existsSync } from "fs";
import { join, resolve, sep, extname } from "path";

/** Docker: /app/apps/api/public (bind-mount ./public). Dev: repo public/ or apps/api/public. */
export function resolvePublicDir(): string {
  if (process.env.UPLOAD_PUBLIC_DIR) {
    return resolve(process.env.UPLOAD_PUBLIC_DIR);
  }
  const monorepoPublic = resolve(process.cwd(), "../../public");
  if (existsSync(monorepoPublic)) return monorepoPublic;
  const appPublic = join(process.cwd(), "public");
  if (existsSync(appPublic)) return appPublic;
  const nested = join(process.cwd(), "apps/api/public");
  if (existsSync(nested)) return nested;
  return appPublic;
}

export function resolvePublicFile(subPath: string, ...segments: string[]): string {
  const root = resolve(resolvePublicDir(), subPath);
  const filePath = resolve(root, ...segments);
  if (filePath !== root && !filePath.startsWith(root + sep)) {
    throw new Error("Invalid path");
  }
  return filePath;
}

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export function contentTypeForPath(filePath: string): string {
  return MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}
