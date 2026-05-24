import { servePublicFile } from "~/lib/serve-public-file";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  return servePublicFile("defaults", segments);
}
