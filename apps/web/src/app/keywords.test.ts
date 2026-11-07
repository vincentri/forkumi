import assert from "node:assert/strict";
import { test } from "node:test";

import { parseKeywords } from "./keywords.ts";

test("parseKeywords splits, trims and de-duplicates", () => {
  assert.deepEqual(
    parseKeywords(" design subscription,  Unlimited  design ,, Design Subscription"),
    ["design subscription", "Unlimited design"],
  );
  assert.deepEqual(parseKeywords(undefined), []);
  assert.deepEqual(parseKeywords(""), []);
});
