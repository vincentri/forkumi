import { servePublicFile } from "~/lib/serve-public-file";

/** Serve /uploads/* — required catch-all; optional [[...path]] did not match reliably in dev. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  return servePublicFile("uploads", segments);
}
