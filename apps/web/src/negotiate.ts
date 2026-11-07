/**
 * Markdown route for a page request when the client asks for markdown (Accept: text/markdown),
 * else null. "/" answers directly (default locale) instead of redirecting first.
 */
export function markdownRewritePath(pathname: string, accept: string | null): string | null {
  if (!accept?.includes("text/markdown")) return null;
  if (pathname === "/") return "/md/id";
  return /^\/(id|en)(\/|$)/.test(pathname) ? `/md${pathname.replace(/\/$/, "")}` : null;
}

/** RFC 8288 Link header on page responses so agents find the machine-readable resources. */
export const AGENT_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/json"',
  '</llms.txt>; rel="service-doc"; type="text/plain"',
].join(", ");
