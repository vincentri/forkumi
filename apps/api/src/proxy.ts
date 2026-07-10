import { NextResponse, type NextRequest } from "next/server";

const LOGIN_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();

function allowedOrigins(): string[] {
  const raw = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
  return raw
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > LOGIN_LIMIT;
}

export function clearLoginAttempts(): void {
  attempts.clear();
}

function setCorsHeaders(response: NextResponse, origin: string | null): void {
  if (!origin) return;
  const allowed = allowedOrigins();
  if (allowed.includes(origin) || allowed.includes(origin.replace(/\/$/, ""))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }
}

export function proxy(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response, origin);
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "900");
    return response;
  }

  if (
    request.method === "POST" &&
    request.nextUrl.pathname === "/api/auth/callback/credentials" &&
    isRateLimited(`login:${getClientIp(request)}`)
  ) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": "900" },
    });
  }

  const response = NextResponse.next();
  setCorsHeaders(response, origin);
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
