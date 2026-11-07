import assert from "node:assert/strict";
import { test } from "node:test";

import {
  API_CATALOG_PROFILE,
  buildApiCatalog,
  buildOpenApi,
  buildPoppyManifest,
} from "./openapi.ts";

type Spec = {
  openapi: string;
  info: { title: string; version: string };
  servers: { url: string }[];
  paths: Record<string, Record<string, unknown>>;
};

const spec = buildOpenApi(
  "https://www.forkumi.co",
  "https://api.forkumi.co",
  ["id", "en"],
  ["", "about/", "contact/"],
) as Spec;

test("openapi document has required 3.1 fields", () => {
  assert.equal(spec.openapi, "3.1.0");
  assert.ok(spec.info.title && spec.info.version);
  assert.deepEqual(spec.servers, [{ url: "https://www.forkumi.co" }]);
});

test("every operation has an operationId and responses; path params are declared", () => {
  const ids = new Set<string>();
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const method of ["get", "post"]) {
      const op = item[method] as
        | { operationId: string; responses: object; parameters?: { name: string }[] }
        | undefined;
      if (!op) continue;
      assert.ok(op.operationId && !ids.has(op.operationId), `${path} operationId`);
      ids.add(op.operationId);
      assert.ok(Object.keys(op.responses).length > 0, `${path} responses`);
      const declared = (op.parameters ?? []).map((p) => p.name).sort();
      const inPath = [...path.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      assert.deepEqual(declared, inPath, `${path} params`);
    }
  }
});

test("all $refs resolve and pages enum excludes the home page", () => {
  const json = JSON.stringify(spec);
  for (const [, ref] of json.matchAll(/"\$ref":"#\/([^"]+)"/g)) {
    const target = ref
      .split("/")
      .reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], spec);
    assert.ok(target, `unresolved $ref ${ref}`);
  }
  assert.ok(json.includes('"enum":["about","contact"]'));
  assert.deepEqual((spec.paths["/api/contact"] as { servers: unknown }).servers, [
    { url: "https://api.forkumi.co" },
  ]);
});

test("api catalog is an RFC 9727 linkset whose items and descriptions resolve", () => {
  const catalog = buildApiCatalog("https://forkumi.co", "https://api.forkumi.co") as {
    linkset: Array<Record<string, unknown> & { anchor: string }>;
  };
  const [self, home, contact] = catalog.linkset;
  assert.equal(self.anchor, "https://forkumi.co/.well-known/api-catalog");
  assert.deepEqual(self.item, [
    { href: "https://forkumi.co/" },
    { href: "https://api.forkumi.co/api/contact" },
  ]);
  assert.deepEqual(home["service-desc"], [
    { href: "https://forkumi.co/openapi.json", type: "application/json" },
  ]);
  assert.equal(contact.anchor, "https://api.forkumi.co/api/contact");
  assert.equal(API_CATALOG_PROFILE, "https://www.rfc-editor.org/info/rfc9727");
});

test("poppy manifest is a website-only 0.1 declaration bound to the bare domain", () => {
  const expected = {
    protocol_version: "0.1",
    organization: { name: "Forkumi", domain: "forkumi.co" },
    web: {},
  };
  assert.deepEqual(buildPoppyManifest("https://forkumi.co", "Forkumi"), expected);
  assert.deepEqual(buildPoppyManifest("https://www.forkumi.co", "Forkumi"), expected);
});
