import { readFile } from "fs/promises";
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

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypeForPath(filePath),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return new NextResponse("Not found", { status: 404 });
    }
    throw error;
  }
}
