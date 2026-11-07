import { LOCALES, PAGE_PATHS, webBaseUrl } from "../markdown";
import { buildOpenApi } from "../openapi";

export function GET(): Response {
  const web = webBaseUrl().origin;
  const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").origin;
  return Response.json(buildOpenApi(web, api, LOCALES, PAGE_PATHS), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
