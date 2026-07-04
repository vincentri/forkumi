import { describe, it, expect } from "vitest";
import {
  DEFAULT_ADMIN_ASSETS,
  DEFAULT_ADMIN_ASSET_PATHS,
  DEFAULT_BRANDING_SETTINGS,
  DEFAULT_FRONT_PAGE_SETTINGS,
} from "../default-assets";

describe("DEFAULT_ADMIN_ASSETS", () => {
  it("has 3 entries", () => {
    expect(DEFAULT_ADMIN_ASSETS).toHaveLength(3);
  });

  it("each has key and path", () => {
    for (const asset of DEFAULT_ADMIN_ASSETS) {
      expect(typeof asset.key).toBe("string");
      expect(typeof asset.path).toBe("string");
      expect(asset.path).toMatch(/^\/defaults\/admin\//);
    }
  });

  it("keys are unique", () => {
    const keys = DEFAULT_ADMIN_ASSETS.map((a) => a.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("DEFAULT_ADMIN_ASSET_PATHS", () => {
  it("derives from DEFAULT_ADMIN_ASSETS", () => {
    expect(DEFAULT_ADMIN_ASSET_PATHS).toEqual(DEFAULT_ADMIN_ASSETS.map((a) => a.path));
  });

  it("has 3 entries", () => {
    expect(DEFAULT_ADMIN_ASSET_PATHS).toHaveLength(3);
  });
});

describe("DEFAULT_BRANDING_SETTINGS", () => {
  it("has 6 entries", () => {
    expect(DEFAULT_BRANDING_SETTINGS).toHaveLength(6);
  });

  it("each has key and value", () => {
    for (const setting of DEFAULT_BRANDING_SETTINGS) {
      expect(typeof setting.key).toBe("string");
      expect(typeof setting.value).toBe("string");
    }
  });

  it("references DEFAULT_ADMIN_ASSETS paths", () => {
    const values = DEFAULT_BRANDING_SETTINGS.map((s) => s.value);
    expect(values).toContain(DEFAULT_ADMIN_ASSETS[0].path);
    expect(values).toContain(DEFAULT_ADMIN_ASSETS[1].path);
    expect(values).toContain(DEFAULT_ADMIN_ASSETS[2].path);
  });

  it("keys are unique", () => {
    const keys = DEFAULT_BRANDING_SETTINGS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("DEFAULT_FRONT_PAGE_SETTINGS", () => {
  it("has 11 entries", () => {
    expect(DEFAULT_FRONT_PAGE_SETTINGS).toHaveLength(11);
  });

  it("each has key, value, and namespace", () => {
    for (const setting of DEFAULT_FRONT_PAGE_SETTINGS) {
      expect(typeof setting.key).toBe("string");
      expect(typeof setting.value).toBe("string");
      expect(typeof setting.namespace).toBe("string");
    }
  });

  it("has expected namespaces", () => {
    const namespaces = new Set(DEFAULT_FRONT_PAGE_SETTINGS.map((s) => s.namespace));
    expect(namespaces).toEqual(new Set(["general", "contact", "seo", "scripts"]));
  });

  it("keys are unique", () => {
    const keys = DEFAULT_FRONT_PAGE_SETTINGS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("general namespace references admin asset paths", () => {
    const general = DEFAULT_FRONT_PAGE_SETTINGS.filter((s) => s.namespace === "general");
    expect(general.find((s) => s.key === "logo")?.value).toBe(DEFAULT_ADMIN_ASSETS[0].path);
    expect(general.find((s) => s.key === "logo_dark")?.value).toBe(DEFAULT_ADMIN_ASSETS[1].path);
    expect(general.find((s) => s.key === "favicon")?.value).toBe(DEFAULT_ADMIN_ASSETS[2].path);
  });
});
