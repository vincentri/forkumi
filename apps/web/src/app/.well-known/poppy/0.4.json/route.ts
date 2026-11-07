import { webBaseUrl } from "../../../markdown";
import { buildPoppyManifest } from "../../../openapi";

export function GET(): Response {
  return Response.json(buildPoppyManifest(webBaseUrl().origin, "Forkumi", "0.4"), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
