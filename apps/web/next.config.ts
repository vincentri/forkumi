import { readFileSync } from "fs";
import { resolve } from "path";
import type { NextConfig } from "next";

// Next.js only reads .env from its own app directory.
// In this monorepo, .env lives at the root; load it manually here.
// Does not override vars already set (so production platform vars win).
try {
  const lines = readFileSync(resolve(process.cwd(), "../../.env"), "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  /* .env not present; env vars provided externally (production) */
}

const apiHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").hostname;
  } catch {
    return "localhost";
  }
})();

const apiProtocol = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").protocol.replace(
      ":",
      "",
    ) as "http" | "https";
  } catch {
    return "http";
  }
})();

function origin(url: string | undefined): string {
  try {
    return url ? new URL(url).origin : "";
  } catch {
    return "";
  }
}

// ponytail: script-src keeps 'unsafe-inline' because Next's inline bootstrap scripts need a
// per-request nonce otherwise, and nonces would force every page back to dynamic rendering.
// If a CMS header/footer script (ExternalHtmlScripts) loads a new origin, add it here.
const apiOrigin = origin(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");
const storageOrigin = origin(process.env.NEXT_PUBLIC_STORAGE_BASE_URL);
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiOrigin} ${storageOrigin}`.trim(),
  `media-src 'self' ${apiOrigin} ${storageOrigin}`.trim(),
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} https://cloudflareinsights.com`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' " + apiOrigin,
  "object-src 'none'",
  ...(apiOrigin.startsWith("https:") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/auth"],
  trailingSlash: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        // Dev needs eval + HMR websockets; enforce CSP on production builds only.
        ...(process.env.NODE_ENV === "production"
          ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
          : []),
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
  // Locale-less paths go to the Indonesian default for good (308). Kept here, not as
  // pages, so no page needs a root layout outside [locale].
  redirects: async () => [
    { source: "/", destination: "/id/", permanent: true },
    {
      source: "/:page(about|contact|packages|portfolio|services)",
      destination: "/id/:page/",
      permanent: true,
    },
  ],
  // Markdown versions for agents: /id.md, /en/about.md
  rewrites: async () => [
    { source: "/:locale(id|en).md", destination: "/md/:locale" },
    { source: "/:locale(id|en)/:page.md", destination: "/md/:locale/:page" },
  ],
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: apiProtocol, hostname: apiHost, pathname: "/**" }],
  },
};

export default nextConfig;
