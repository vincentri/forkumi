import assert from "node:assert/strict";
import { test } from "node:test";

import { markdownRewritePath } from "./negotiate.ts";

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
