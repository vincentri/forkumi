import { LOCALES, PAGE_PATHS, pageMarkdown } from "../markdown";

export async function GET(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const pages = await Promise.all(
    LOCALES.flatMap((locale) =>
      PAGE_PATHS.map((pagePath) => pageMarkdown(origin, locale, pagePath)),
    ),
  );

  return new Response(pages.join("\n---\n\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
