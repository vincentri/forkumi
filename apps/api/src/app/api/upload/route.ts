import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { existsSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomBytes } from "crypto";
import { resolvePublicDir } from "~/lib/public-files";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]);

function sanitizePath(raw: string | null): string {
  if (!raw) return "uploads";
  const clean = raw.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+/, "").slice(0, 80);
  return clean || "uploads";
}

function publicBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3001";
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
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum size is 5 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = extname(file.name).toLowerCase() || ".png";
  const filename = `${randomBytes(16).toString("hex")}${ext}`;

  const rawPath = req.nextUrl.searchParams.get("path");
  const subPath = sanitizePath(rawPath);
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
    const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? `https://${bucket}.s3.${region}.amazonaws.com`;
    return NextResponse.json({ url: `${baseUrl}/${key}` });
  }

  const publicDir = resolvePublicDir();
  const targetDir = join(publicDir, subPath);
  const filePath = join(targetDir, filename);

  try {
    await mkdir(targetDir, { recursive: true });
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error("[upload] write failed", { publicDir, filePath, err });
    return NextResponse.json({ error: "Failed to save file on server" }, { status: 500 });
  }

  if (!existsSync(filePath)) {
    console.error("[upload] file missing after write", { filePath });
    return NextResponse.json({ error: "Failed to persist file" }, { status: 500 });
  }

  return NextResponse.json({ url: `${publicBaseUrl()}/${subPath}/${filename}` });
}
