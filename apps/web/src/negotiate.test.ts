import assert from "node:assert/strict";
import { test } from "node:test";

import { AGENT_LINK_HEADER, markdownRewritePath } from "./negotiate.ts";

test("Accept: text/markdown maps pages, including /, to the markdown route", () => {
  assert.equal(markdownRewritePath("/", "text/markdown"), "/md/id");
  assert.equal(markdownRewritePath("/id", "text/markdown"), "/md/id");
  assert.equal(markdownRewritePath("/id/", "text/markdown, text/html;q=0.5"), "/md/id");
  assert.equal(markdownRewritePath("/en/about/", "text/markdown"), "/md/en/about");
});

test("HTML and non-page requests are left alone", () => {
  assert.equal(markdownRewritePath("/", "text/html"), null);
  assert.equal(markdownRewritePath("/id/", null), null);
  assert.equal(markdownRewritePath("/openapi.json", "text/markdown"), null);
  assert.equal(markdownRewritePath("/idea/", "text/markdown"), null);
});

test("AGENT_LINK_HEADER is RFC 8288 syntax with agent-useful relations", () => {
  const links = AGENT_LINK_HEADER.split(", ");
  for (const link of links) assert.match(link, /^<\/[^>]+>; rel="[a-z-]+"(; type="[^"]+")?$/);
  const rels = links.map((link) => /rel="([^"]+)"/.exec(link)?.[1]);
  assert.deepEqual(rels, ["api-catalog", "service-desc", "service-doc"]);
});
