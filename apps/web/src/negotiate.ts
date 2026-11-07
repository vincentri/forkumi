/**
 * Markdown route for a page request when the client asks for markdown (Accept: text/markdown),
 * else null. "/" answers directly (default locale) instead of redirecting first.
 */
export function markdownRewritePath(pathname: string, accept: string | null): string | null {
  if (!accept?.includes("text/markdown")) return null;
  if (pathname === "/") return "/md/id";
  return /^\/(id|en)(\/|$)/.test(pathname) ? `/md${pathname.replace(/\/$/, "")}` : null;
}
