import { readFileSync } from "fs";
import { resolve } from "path";
import type { NextConfig } from "next";

// Next.js only reads .env from its own app directory.
// In this monorepo, .env lives at the root — load it manually here.
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
} catch { /* .env not present — env vars provided externally (production) */ }

const apiHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").hostname;
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/auth"],
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: apiHost, pathname: "/**" }],
  },
};

export default nextConfig;
