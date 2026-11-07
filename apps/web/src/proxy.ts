import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  const [locale, ...segments] = pathname.split("/").filter(Boolean);

  // Agents (Claude Code, OpenCode, ...) ask for markdown via Accept; serve the .md version.
  if (
    request.headers.get("accept")?.includes("text/markdown") &&
    /^\/(id|en)(\/|$)/.test(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/md${pathname.replace(/\/$/, "")}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("Vary", "Accept");
    return response;
  }

  requestHeaders.set("x-forkumi-locale", locale === "en" ? "en" : "id");
  requestHeaders.set("x-forkumi-page-path", segments.length > 0 ? `${segments.join("/")}/` : "");

  // ponytail: no Vary: Accept here; pages are dynamic (no-store) and Next overwrites Vary.
  // Add it via next.config headers() if HTML ever becomes CDN-cacheable.
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
