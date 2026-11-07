import { jsonError } from "../../../api-error";
import { LOCALES, PAGE_PATHS, pageMarkdown } from "../../../markdown";

type Params = { params: Promise<{ locale: string; path?: string[] }> };

export async function GET(request: Request, { params }: Params): Promise<Response> {
  const { locale, path = [] } = await params;
  const pagePath = path.length > 0 ? `${path.join("/")}/` : "";

  // Only known pages: keeps the self-fetch from reaching arbitrary paths.
  if (
    !LOCALES.includes(locale as (typeof LOCALES)[number]) ||
    !PAGE_PATHS.includes(pagePath as (typeof PAGE_PATHS)[number])
  ) {
    return jsonError(
      404,
      "page_not_found",
      `No markdown version of /${locale}/${pagePath}.`,
      `Known pages: ${PAGE_PATHS.map((page) => `/${LOCALES[0]}/${page}`).join(", ")} (also under /en/). See /llms.txt.`,
    );
  }

  const markdown = await pageMarkdown(
    new URL(request.url).origin,
    locale as (typeof LOCALES)[number],
    pagePath,
  );
  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
