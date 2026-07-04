import { describe, it, expect } from "vitest";
import {
  DEFAULT_ADMIN_ASSETS,
  DEFAULT_ADMIN_ASSET_PATHS,
  DEFAULT_BRANDING_SETTINGS,
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
