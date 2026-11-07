import assert from "node:assert/strict";
import { test } from "node:test";

import { fallbackMarkdown, selfFetchTarget } from "./self-fetch.ts";

test("selfFetchTarget uses the request origin off Vercel", () => {
  assert.deepEqual(selfFetchTarget("https://www.forkumi.co", {}), {
    origin: "https://www.forkumi.co",
    headers: {},
  });
  // Without the bypass secret the protected deployment URL would 302, so keep the origin.
  assert.equal(
    selfFetchTarget("https://www.forkumi.co", { VERCEL_URL: "x.vercel.app" }).origin,
    "https://www.forkumi.co",
  );
});

test("selfFetchTarget skips Cloudflare via the deployment URL on Vercel", () => {
  assert.deepEqual(
    selfFetchTarget("https://www.forkumi.co", {
      VERCEL_URL: "forkumi-abc.vercel.app",
      VERCEL_AUTOMATION_BYPASS_SECRET: "s3cret",
    }),
    {
      origin: "https://forkumi-abc.vercel.app",
      headers: { "x-vercel-protection-bypass": "s3cret" },
    },
  );
});

test("fallbackMarkdown is nonempty markdown with title and links", () => {
  const md = fallbackMarkdown(
    "https://f.co/en/",
    "Forkumi",
    "Design subscription",
    "en",
    "https://f.co/llms.txt",
  );
  assert.match(md, /^# Forkumi\n\nDesign subscription\n\n/);
  assert.ok(md.includes("https://f.co/en/") && md.includes("https://f.co/llms.txt"));
  assert.match(fallbackMarkdown("u", "t", "d", "id", "i"), /sementara tidak tersedia/);
});
