import { NodeHtmlMarkdown, type TranslatorConfigFactory } from "node-html-markdown";

import { fetchNextOptions } from "./cache-config";
import { fallbackMarkdown, selfFetchTarget } from "./self-fetch";
import { getFrontPageSettings, normalizeLocale } from "./front-page-settings";
import { buildSeoMetadata } from "./seo";

export const LOCALES = ["id", "en"] as const;
export const PAGE_PATHS = [
  "",
  "about/",
  "services/",
  "portfolio/",
  "packages/",
  "contact/",
] as const;

type Locale = (typeof LOCALES)[number];

export function webBaseUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000");
}

export function pageUrl(locale: Locale, pagePath: string): string {
  return new URL(`/${locale}/${pagePath}`, webBaseUrl()).toString();
}

export function markdownUrl(locale: Locale, pagePath: string): string {
  const slug = pagePath.replace(/\/$/, "");
  return new URL(slug ? `/${locale}/${slug}.md` : `/${locale}.md`, webBaseUrl()).toString();
}

// Drop decorative duplicates (marquee copies, icons) marked aria-hidden.
const skipHidden: TranslatorConfigFactory = (ctx) =>
  ctx.node.getAttribute("aria-hidden") === "true" ? { ignore: true } : (ctx.base ?? {});

const converter = new NodeHtmlMarkdown(
  { ignore: ["script", "style", "noscript", "svg", "form", "button"] },
  {
    span: skipHidden,
    div: skipHidden,
    // Headings use <br> for visual line breaks; keep them on one line.
    "h1,h2,h3,h4,h5,h6": ({ node }) => ({
      prefix: `${"#".repeat(Number(node.tagName.charAt(1)))} `,
      postprocess: ({ content }) => content.replace(/\s*\n\s*/g, " "),
    }),
    // Empty alt = decorative image (sparkles etc.).
    img: ({ node }) => {
      const alt = node.getAttribute("alt")?.trim();
      const src = node.getAttribute("src");
      return alt && src ? { content: `![${alt}](${src})`, recurse: false } : { ignore: true };
    },
  },
);

export async function pageMeta(
  rawLocale: string,
  pagePath: string,
): Promise<{ title: string; description: string }> {
  const locale = normalizeLocale(rawLocale);
  const settings = await getFrontPageSettings(locale);
  const meta = buildSeoMetadata({ locale, pagePath, settings });
  return { title: String(meta.title), description: meta.description ?? "" };
}

async function renderedMain(origin: string, locale: Locale, pagePath: string): Promise<string> {
  const target = selfFetchTarget(origin);
  const response = await fetch(new URL(`/${locale}/${pagePath}`, target.origin), {
    ...fetchNextOptions(["markdown"]),
    headers: target.headers,
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`Fetching /${locale}/${pagePath} failed: ${response.status}`);
  }
  return /<main[^>]*>([\s\S]*)<\/main>/.exec(await response.text())?.[1] ?? "";
}

/** Renders the live HTML page and converts its <main> to markdown. */
export async function pageMarkdown(
  origin: string,
  locale: Locale,
  pagePath: string,
): Promise<string> {
  const { title, description } = await pageMeta(locale, pagePath);
  const url = pageUrl(locale, pagePath);
  const frontMatter = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nurl: ${url}\n---`;

  let main: string;
  try {
    main = await renderedMain(origin, locale, pagePath);
  } catch (error) {
    // Agents still get a nonempty markdown answer (title, summary, links) instead of a 500.
    console.error(error);
    return `${frontMatter}\n\n${fallbackMarkdown(url, title, description, locale, new URL("/llms.txt", webBaseUrl()).toString())}\n`;
  }
  const body = converter
    .translate(main)
    // Absolute links so the file still works when read outside the site.
    // Relative hrefs ("packages") are locale-root relative, matching SoftNavInterceptor.
    .replace(/\]\(([^)\s]+)/g, (_, href: string) => {
      const base = href.startsWith("#") ? url : pageUrl(locale, "");
      return `](${new URL(href, base).toString()}`;
    })
    // Inline-flex button rows render as adjacent links; separate them.
    .replace(/\)\[/g, ") [");
  return `${frontMatter}\n\n${body}\n`;
}
