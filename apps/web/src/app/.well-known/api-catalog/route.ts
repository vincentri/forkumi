import { webBaseUrl } from "../../markdown";
import { API_CATALOG_PROFILE, buildApiCatalog } from "../../openapi";

const headers = {
  "Content-Type": `application/linkset+json; profile="${API_CATALOG_PROFILE}"`,
  // RFC 9727 §2: HEAD must carry a Link with rel="api-catalog".
  Link: '</.well-known/api-catalog>; rel="api-catalog"',
  "Access-Control-Allow-Origin": "*",
};

export function GET(): Response {
  const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").origin;
  return new Response(JSON.stringify(buildApiCatalog(webBaseUrl().origin, api)), { headers });
}

export function HEAD(): Response {
  return new Response(null, { headers });
}
