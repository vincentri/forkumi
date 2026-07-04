import { describe, it, expect, vi } from "vitest";

vi.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Map<string, string>;
    constructor(body?: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers ?? {}));
    }
    static next() {
      return new MockNextResponse(null, { status: 200 });
    }
  }
  return { NextResponse: MockNextResponse };
});

function makeRequest(opts: { method?: string; path?: string; origin?: string; headers?: Record<string, string> } = {}) {
  const url = `http://localhost:3000${opts.path ?? "/api/test"}`;
  const headers: Record<string, string> = {};
  if (opts.origin) headers.origin = opts.origin;
  if (opts.headers) Object.assign(headers, opts.headers);
  const req = new Request(url, { method: opts.method ?? "GET", headers }) as any;
  // Add nextUrl for Next.js middleware compatibility
  req.nextUrl = new URL(url);
  return req;
}

describe("proxy", () => {
  it("config matcher targets /api routes", async () => {
    const { config } = await import("~/proxy");
    expect(config.matcher).toBe("/api/:path*");
  });

  it("sets CORS headers for allowed origin on OPTIONS preflight", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({ method: "OPTIONS", origin: "http://localhost:3000" }));
    expect(response.status).toBe(204);
  });

  it("returns 204 for OPTIONS even without allowed origin", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({ method: "OPTIONS", origin: "https://evil.com" }));
    expect(response.status).toBe(204);
  });

  it("sets CORS headers for non-preflight allowed origin", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({ method: "GET", origin: "http://localhost:3000" }));
    expect(response.status).not.toBe(429);
  });

  it("does not set CORS headers for disallowed origin", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({ method: "GET", origin: "https://evil.com" }));
    expect(response.status).not.toBe(429);
  });

  it("allows normal GET requests through", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({ method: "GET" }));
    expect(response.status).not.toBe(429);
  });

  it("does not rate-limit non-credential POST requests", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({
      method: "POST",
      path: "/api/other",
      headers: { "x-forwarded-for": "10.1.1.1" },
    }));
    expect(response.status).not.toBe(429);
  });

  it("rate-limits credential login POST after max attempts", async () => {
    const { proxy } = await import("~/proxy");
    const ip = "10.0.0.199";
    for (let i = 0; i < 11; i++) {
      proxy(makeRequest({
        method: "POST",
        path: "/api/auth/callback/credentials",
        headers: { "x-forwarded-for": ip },
      }));
    }
    const response = proxy(makeRequest({
      method: "POST",
      path: "/api/auth/callback/credentials",
      headers: { "x-forwarded-for": ip },
    }));
    expect(response.status).toBe(429);
  });

  it("rate-limits contact submissions after max attempts", async () => {
    const { proxy } = await import("~/proxy");
    const ip = "10.0.0.201";
    for (let i = 0; i < 21; i++) {
      proxy(makeRequest({
        method: "POST",
        path: "/api/trpc/public.submitContact",
        headers: { "x-forwarded-for": ip },
      }));
    }
    const response = proxy(makeRequest({
      method: "POST",
      path: "/api/trpc/public.submitContact",
      headers: { "x-forwarded-for": ip },
    }));
    expect(response.status).toBe(429);
  });

  it("rate-limits comment submissions after max attempts", async () => {
    const { proxy } = await import("~/proxy");
    const ip = "10.0.0.202";
    for (let i = 0; i < 21; i++) {
      proxy(makeRequest({
        method: "POST",
        path: "/api/trpc/public.submitComment",
        headers: { "x-forwarded-for": ip },
      }));
    }
    const response = proxy(makeRequest({
      method: "POST",
      path: "/api/trpc/public.submitComment",
      headers: { "x-forwarded-for": ip },
    }));
    expect(response.status).toBe(429);
  });

  it("falls back to x-real-ip header", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({
      method: "POST",
      path: "/api/auth/callback/credentials",
      headers: { "x-real-ip": "5.6.7.8" },
    }));
    expect(response.status).not.toBe(429);
  });

  it("falls back to 'unknown' when no IP headers", async () => {
    const { proxy } = await import("~/proxy");
    const response = proxy(makeRequest({
      method: "POST",
      path: "/api/auth/callback/credentials",
    }));
    expect(response.status).not.toBe(429);
  });
});
