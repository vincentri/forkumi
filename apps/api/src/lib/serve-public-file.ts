import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import { contentTypeForPath, resolvePublicFile } from "~/lib/public-files";

/** Read from bind-mounted public/ at request time (Next.js static serving misses new files). */
export async function servePublicFile(
  subPath: string,
  segments: string[],
): Promise<NextResponse> {
  let filePath: string;
  try {
    filePath = resolvePublicFile(subPath, ...segments);
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readFile(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentTypeForPath(filePath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
