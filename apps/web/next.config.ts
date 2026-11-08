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

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/auth"],
  trailingSlash: true,
  // Markdown versions for agents: /id.md, /en/about.md
  // ponytail: no CSP yet; ExternalHtmlScripts injects CMS-supplied scripts, so a CSP needs their origins first.
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
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
