import { jsonError } from "../../api-error";
import { webBaseUrl } from "../../markdown";

// The public site has no /api; answer agents in JSON instead of the HTML 404 page.
function notFound(request: Request): Response {
  const { pathname } = new URL(request.url);
  const spec = new URL("/openapi.json", webBaseUrl()).toString();
  return jsonError(
    404,
    "not_found",
    `No API endpoint at ${pathname}.`,
    `See ${spec} for the available endpoints.`,
  );
}

export {
  notFound as GET,
  notFound as POST,
  notFound as PUT,
  notFound as PATCH,
  notFound as DELETE,
  notFound as HEAD,
  notFound as OPTIONS,
};
