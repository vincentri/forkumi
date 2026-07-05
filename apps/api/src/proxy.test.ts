import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

function makeRequest({
  method = "GET",
  pathname = "/api/trpc/user.list",
  origin = "http://localhost:3000",
  ip = "127.0.0.1",
}: {
  method?: string;
  pathname?: string;
  origin?: string;
  ip?: string;
} = {}): NextRequest {
  return new NextRequest(`http://localhost:3001${pathname}`, {
    method,
    headers: {
      origin,
      "x-forwarded-for": ip,
    },
  });
}

async function loadProxy(): Promise<typeof import("./proxy")> {
  vi.resetModules();
  return import("./proxy");
}

describe("proxy", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets CORS headers for allowed OPTIONS preflight requests", async () => {
    const { proxy } = await loadProxy();

    const response = proxy(makeRequest({ method: "OPTIONS" }));

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("does not set allow-origin for disallowed origins", async () => {
    const { proxy } = await loadProxy();

    const response = proxy(
      makeRequest({ method: "OPTIONS", origin: "https://example.com" }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("rate-limits repeated credential login attempts by IP", async () => {
    const { proxy } = await loadProxy();
    let response = proxy(
      makeRequest({
        method: "POST",
        pathname: "/api/auth/callback/credentials",
        ip: "10.0.0.200",
      }),
    );

    for (let i = 0; i < 10; i += 1) {
      response = proxy(
        makeRequest({
          method: "POST",
          pathname: "/api/auth/callback/credentials",
          ip: "10.0.0.200",
        }),
      );
    }

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("900");
  });

  it("does not rate-limit non-login API posts", async () => {
    const { proxy } = await loadProxy();

    for (let i = 0; i < 20; i += 1) {
      const response = proxy(
        makeRequest({
          method: "POST",
          pathname: "/api/trpc/settings.update",
          ip: "10.0.0.201",
        }),
      );

      expect(response.status).not.toBe(429);
    }
  });
});
