import { webBaseUrl } from "../markdown";

// Plain route (not MetadataRoute.Robots) because Content-Signal isn't in Next's type.
// Content-Signal: https://contentsignals.org — we allow search, AI answers, and training.
export function GET(): Response {
  const base = webBaseUrl();
  const body = [
    "User-agent: *",
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "Allow: /",
    "",
    `Sitemap: ${new URL("/sitemap.xml", base).toString()}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
