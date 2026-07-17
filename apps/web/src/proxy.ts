import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const [locale, ...segments] = request.nextUrl.pathname.split("/").filter(Boolean);

  requestHeaders.set("x-forkumi-locale", locale === "en" ? "en" : "id");
  requestHeaders.set(
    "x-forkumi-page-path",
    segments.length > 0 ? `${segments.join("/")}/` : "",
  );

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
