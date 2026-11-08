import sharp from "sharp";

const MAX_WIDTH = 2000;

/**
 * PNG/JPEG uploads become WebP, at most 2000px wide. Phone photos and design exports are
 * often 1-5 MB; the same image as WebP is usually a tenth of that. GIF (animation), SVG
 * and WebP pass through untouched.
 */
export async function optimizeImage(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  if (mime !== "image/png" && mime !== "image/jpeg") return null;
  const out = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { buffer: out, mime: "image/webp", ext: ".webp" };
}
