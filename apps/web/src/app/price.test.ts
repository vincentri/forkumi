import assert from "node:assert/strict";
import { test } from "node:test";

import { parsePrice } from "./price.ts";

test("parsePrice", () => {
  assert.deepEqual(parsePrice("Rp 2.900k"), { price: 2_900_000, currency: "IDR" });
  assert.deepEqual(parsePrice("Rp 2.000.000"), { price: 2_000_000, currency: "IDR" });
  assert.deepEqual(parsePrice("Rp 1,5jt"), { price: 1_500_000, currency: "IDR" });
  assert.deepEqual(parsePrice("IDR 750rb"), { price: 750_000, currency: "IDR" });
  assert.deepEqual(parsePrice("USD 299"), { price: 299, currency: "USD" });
  assert.deepEqual(parsePrice("$1,199.50"), { price: 1199.5, currency: "USD" });
  assert.equal(parsePrice("Contact us"), undefined);
  assert.equal(parsePrice("299"), undefined);
});
