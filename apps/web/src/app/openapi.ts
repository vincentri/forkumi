const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const text = (description: string, type = "text/plain") => ({
  description,
  content: { [type]: { schema: { type: "string" } } },
});

const contactError = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { type: "object", required: ["error"], properties: { error: { type: "string" } } },
    },
  },
});

/** OpenAPI 3.1 description of the public, agent-facing endpoints. */
export function buildOpenApi(
  webUrl: string,
  apiUrl: string,
  locales: readonly string[],
  pagePaths: readonly string[],
): Record<string, unknown> {
  const pages = pagePaths.filter(Boolean).map((page) => page.replace(/\/$/, ""));
  const locale = {
    name: "locale",
    in: "path",
    required: true,
    schema: { type: "string", enum: [...locales] },
    description: "id = Bahasa Indonesia, en = English.",
  };

  return {
    openapi: "3.1.0",
    info: {
      title: "Forkumi public API",
      version: "1.0.0",
      description:
        "Read-only content endpoints for agents plus the contact form. Every HTML page also answers `Accept: text/markdown` with markdown.",
    },
    servers: [{ url: webUrl }],
    paths: {
      "/llms.txt": {
        get: {
          operationId: "getLlmsTxt",
          summary: "Site summary, key facts, plans and page index (llmstxt.org format).",
          responses: { "200": text("llms.txt document.") },
        },
      },
      "/llms-full.txt": {
        get: {
          operationId: "getLlmsFullTxt",
          summary: "Every page in both languages as markdown, in one file.",
          responses: { "200": text("All pages as markdown.") },
        },
      },
      "/{locale}.md": {
        get: {
          operationId: "getHomeMarkdown",
          summary: "Home page as markdown.",
          parameters: [locale],
          responses: {
            "200": text("Markdown with YAML front matter.", "text/markdown"),
            "404": errorResponse("Unknown locale."),
          },
        },
      },
      "/{locale}/{page}.md": {
        get: {
          operationId: "getPageMarkdown",
          summary: "Any page as markdown.",
          parameters: [
            locale,
            { name: "page", in: "path", required: true, schema: { type: "string", enum: pages } },
          ],
          responses: {
            "200": text("Markdown with YAML front matter.", "text/markdown"),
            "404": errorResponse("Unknown locale or page."),
          },
        },
      },
      "/api/contact": {
        servers: [{ url: apiUrl }],
        post: {
          operationId: "submitContact",
          summary: "Send a message to the Forkumi team (same as the website contact form).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "message"],
                  properties: {
                    name: { type: "string", minLength: 1, maxLength: 200 },
                    email: { type: "string", format: "email", maxLength: 200 },
                    pkg: { type: "string", maxLength: 100, description: "Plan of interest." },
                    message: { type: "string", minLength: 1, maxLength: 5000 },
                    locale: { type: "string", enum: [...locales] },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Message stored.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["success", "id"],
                    properties: { success: { const: true }, id: { type: "string" } },
                  },
                },
              },
            },
            "400": contactError("Invalid JSON or input; `error` says which field to fix."),
            "500": contactError(
              "Server error; retry later or use the contact details in /llms.txt.",
            ),
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message", "hint"],
              properties: {
                code: { type: "string", examples: ["not_found"] },
                message: { type: "string" },
                hint: { type: "string", description: "How to resolve the error." },
              },
            },
          },
        },
      },
    },
  };
}

export const API_CATALOG_PROFILE = "https://www.rfc-editor.org/info/rfc9727";

/** RFC 9727 API catalog (RFC 9264 linkset) for /.well-known/api-catalog. */
export function buildApiCatalog(webUrl: string, apiUrl: string): Record<string, unknown> {
  const web = (path: string) => new URL(path, webUrl).toString();
  return {
    linkset: [
      {
        anchor: web("/.well-known/api-catalog"),
        item: [{ href: web("/") }, { href: new URL("/api/contact", apiUrl).toString() }],
      },
      {
        anchor: web("/"),
        "service-desc": [{ href: web("/openapi.json"), type: "application/json" }],
        "service-doc": [{ href: web("/llms.txt"), type: "text/plain" }],
      },
      {
        anchor: new URL("/api/contact", apiUrl).toString(),
        "service-desc": [{ href: web("/openapi.json"), type: "application/json" }],
      },
    ],
  };
}

export const POPPY_VERSIONS = ["0.1", "0.4"] as const;
export const POPPY_ALT_PATH = "/.well-known/poppy/0.4.json";

/**
 * Personal Agent Protocol (Poppy) manifest, website-only: agents browse as signed-out
 * visitors, so no auth issuer. /.well-known/poppy.json is 0.1 (what isitagentready validates)
 * and names the 0.4 document in supported_versions; pre-1.0 versions aren't compatible
 * across minors (spec 3.4), so agents pick whichever they implement.
 */
export function buildPoppyManifest(
  webUrl: string,
  name: string,
  version: (typeof POPPY_VERSIONS)[number] = "0.1",
): Record<string, unknown> {
  return {
    protocol_version: version,
    organization: { name, domain: new URL(webUrl).hostname.replace(/^www\./, "") },
    // Alternate documents carry no supported_versions (spec 3.4).
    ...(version === "0.1"
      ? { supported_versions: { "0.4": new URL(POPPY_ALT_PATH, webUrl).toString() } }
      : {}),
    web: {},
  };
}
