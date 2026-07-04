import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomBytes } from "crypto";
import DOMPurify from "isomorphic-dompurify";
import { resolvePublicDir } from "~/lib/public-files";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB — images
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB — videos
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);
const ALLOWED_VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);

function sanitizeSvg(buffer: Buffer): Buffer | null {
  const raw = buffer.toString("utf8").trim();
  if (!/<svg[\s>]/i.test(raw)) return null;
  const clean = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "foreignObject"],
    FORBID_ATTR: ["onload", "onclick", "onerror", "onmouseover", "onfocus", "onblur", "onabort"],
  });
  if (typeof clean !== "string" || !clean.includes("<svg")) return null;
  return Buffer.from(clean, "utf8") as Buffer;
}

function sanitizePath(raw: string | null): string {
  if (!raw) return "uploads";
  const clean = raw.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+/, "").slice(0, 80);
  return clean || "uploads";
}

function isUploadPath(subPath: string): boolean {
  return subPath === "uploads" || subPath.startsWith("uploads/");
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions: string[] = (session.user as { permissions?: string[] }).permissions ?? [];
  const isProtectedRole: boolean = (session.user as { isProtectedRole?: boolean }).isProtectedRole ?? false;
  const canUpload =
    isProtectedRole ||
    permissions.includes("settings:update") ||
    permissions.includes("*:update");

  if (!canUpload) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const isVideo = ALLOWED_VIDEO_MIME.has(file.type);
  if (!ALLOWED_MIME.has(file.type) && !isVideo) {
    return NextResponse.json({ error: "Only image (JPEG, PNG, GIF, WebP, SVG) or video (MP4, WebM, MOV) files are allowed" }, { status: 400 });
  }
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_SIZE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large. Maximum size is ${maxBytes / (1024 * 1024)} MB.` }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(arrayBuffer) as Buffer;
  const ext = extname(file.name).toLowerCase() || ".png";
  if (isVideo ? !ALLOWED_VIDEO_EXTENSIONS.has(ext) : !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "Unsupported file extension." }, { status: 400 });
  }
  if (ext === ".svg" || file.type === "image/svg+xml") {
    const sanitized = sanitizeSvg(buffer);
    if (!sanitized) {
      return NextResponse.json({ error: "Invalid or unsafe SVG." }, { status: 400 });
    }
    buffer = sanitized as Buffer;
  }
  const filename = `${randomBytes(16).toString("hex")}${ext}`;

  const rawPath = req.nextUrl.searchParams.get("path");
  const subPath = sanitizePath(rawPath);
  const assetPath = `/${subPath}/${filename}`;
  if (!isUploadPath(subPath)) {
    return NextResponse.json({ error: "Upload path must be under uploads/." }, { status: 400 });
  }

  const provider = process.env.STORAGE_PROVIDER ?? "local";

  if (provider === "s3") {
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_S3_BUCKET;
    if (!region || !bucket) {
      return NextResponse.json({ error: "S3 not configured. Set AWS_REGION and AWS_S3_BUCKET." }, { status: 500 });
    }
    const s3 = new S3Client({ region });
    const key = `${subPath}/${filename}`;
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));
    return NextResponse.json({ url: assetPath });
  }

  const publicDir = resolvePublicDir();
  const targetDir = join(/* turbopackIgnore: true */ publicDir, subPath);
  const filePath = join(/* turbopackIgnore: true */ targetDir, filename);

  try {
    await mkdir(targetDir, { recursive: true });
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error("[upload] write failed", { publicDir, filePath, err });
    return NextResponse.json({ error: "Failed to save file on server" }, { status: 500 });
  }

  return NextResponse.json({ url: assetPath });
}
