import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DEFAULT_ADMIN_ASSET_PATHS } from "@repo/db/default-assets";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function loadRootEnv() {
  const envPath = new URL("../../../.env", import.meta.url);
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#\s][^=]*)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function contentTypeFor(path: string): string {
  return CONTENT_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";
}

function assetKey(assetPath: string): string {
  return assetPath.replace(/^\/+/, "");
}

async function main() {
  loadRootEnv();

  if (process.env.STORAGE_PROVIDER !== "s3") {
    console.log("Default asset S3 upload skipped: STORAGE_PROVIDER is not s3.");
    return;
  }

  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) {
    throw new Error("S3 default asset upload requires AWS_REGION and AWS_S3_BUCKET.");
  }

  const s3 = new S3Client({ region });
  const publicDir = join(process.cwd(), "../../public");
  const uniquePaths = [...new Set(DEFAULT_ADMIN_ASSET_PATHS)];

  for (const assetPath of uniquePaths) {
    const key = assetKey(assetPath);
    const body = await readFile(join(publicDir, key));

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentTypeFor(assetPath),
    }));

    console.log(`Uploaded ${assetPath} to s3://${bucket}/${key}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
