import { existsSync } from "fs";
import { join, resolve, sep, extname } from "path";

let cachedPublicDir: string | null = null;

/** Docker: /app/apps/api/public (bind-mount ./public). Dev: repo public/ or apps/api/public. */
export function resolvePublicDir(): string {
  if (cachedPublicDir) return cachedPublicDir;

  if (process.env.UPLOAD_PUBLIC_DIR) {
    cachedPublicDir = resolve(process.env.UPLOAD_PUBLIC_DIR);
    return cachedPublicDir;
  }
  const monorepoPublic = resolve(/* turbopackIgnore: true */ process.cwd(), "../../public");
  if (existsSync(monorepoPublic)) {
    cachedPublicDir = monorepoPublic;
    return cachedPublicDir;
  }
  const appPublic = join(/* turbopackIgnore: true */ process.cwd(), "public");
  if (existsSync(appPublic)) {
    cachedPublicDir = appPublic;
    return cachedPublicDir;
  }
  const nested = join(/* turbopackIgnore: true */ process.cwd(), "apps/api/public");
  if (existsSync(nested)) {
    cachedPublicDir = nested;
    return cachedPublicDir;
  }
  cachedPublicDir = appPublic;
  return cachedPublicDir;
}

export function clearPublicDirCache(): void {
  cachedPublicDir = null;
}

export function resolvePublicFile(subPath: string, ...segments: string[]): string {
  const root = resolve(/* turbopackIgnore: true */ resolvePublicDir(), subPath);
  const filePath = resolve(/* turbopackIgnore: true */ root, ...segments);
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
