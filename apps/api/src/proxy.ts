import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

// In-memory rate limiter (Edge runtime; resets on cold start)
const RATE_LIMIT_MAX = 10;
const PUBLIC_MUTATION_RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const PUBLIC_MUTATION_PATHS = new Set([
  "/api/trpc/public.submitContact",
  "/api/trpc/public.submitComment",
]);

type RateEntry = { count: number; windowStart: number };
const rateLimitStore = new Map<string, RateEntry>();

function isRateLimited(key: string, max = RATE_LIMIT_MAX): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > max) return true;
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function proxy(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate-limit credential login attempts (brute-force protection)
  if (
    request.method === "POST" &&
    request.nextUrl.pathname === "/api/auth/callback/credentials"
  ) {
    if (isRateLimited(`login:${ip}`)) {
      return new NextResponse("Too many login attempts. Try again in 15 minutes.", {
        status: 429,
        headers: { "Retry-After": "900" },
      });
    }
  }

  if (request.method === "POST" && PUBLIC_MUTATION_PATHS.has(request.nextUrl.pathname)) {
    // ponytail: local Map is enough for now; swap key store for Redis if spam volume warrants it.
    if (isRateLimited(`public:${request.nextUrl.pathname}:${ip}`, PUBLIC_MUTATION_RATE_LIMIT_MAX)) {
      return new NextResponse("Too many requests.", {
        status: 429,
        headers: { "Retry-After": "900" },
      });
    }
  }

  const origin = request.headers.get("origin") ?? "";
  const isAllowed = origin === ALLOWED_ORIGIN;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Vary", "Origin");
    if (isAllowed) {
      const requestedHeaders = request.headers.get("access-control-request-headers");
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", requestedHeaders ?? "Content-Type, Authorization");
    }
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("Vary", "Origin");
  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
