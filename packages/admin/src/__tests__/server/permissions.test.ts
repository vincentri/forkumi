import { describe, it, expect } from "vitest";
import { derivePermissionOptions } from "../../server/permissions";
import type { CRUDConfig } from "@repo/crud";

function makeConfig(overrides: Partial<CRUDConfig> = {}): CRUDConfig {
  return {
    model: "post",
    label: "Posts",
    fields: [],
    ...overrides,
  } as CRUDConfig;
}

describe("derivePermissionOptions", () => {
  it("starts with 4 wildcard actions", () => {
    const result = derivePermissionOptions([]);
    const wildcards = result.filter((o) => o.value.startsWith("*:"));
    expect(wildcards).toHaveLength(4);
    expect(wildcards.map((w) => w.value)).toEqual(["*:view", "*:create", "*:update", "*:delete"]);
  });

  it("capitalizes action in label", () => {
    const result = derivePermissionOptions([]);
    expect(result[0].label).toBe("* — View (all)");
    expect(result[1].label).toBe("* — Create (all)");
  });

  it("generates 4 actions per standard config", () => {
    const config = makeConfig();
    const result = derivePermissionOptions([config]);
    const modelPerms = result.filter((o) => o.value.startsWith("post:"));
    expect(modelPerms).toHaveLength(4);
    expect(modelPerms.map((p) => p.value)).toEqual(["post:view", "post:create", "post:update", "post:delete"]);
  });

  it("generates only view for readOnly config", () => {
    const config = makeConfig({ readOnly: true });
    const result = derivePermissionOptions([config]);
    const modelPerms = result.filter((o) => o.value.startsWith("post:"));
    expect(modelPerms).toHaveLength(1);
    expect(modelPerms[0].value).toBe("post:view");
  });

  it("generates view+update for keyValue config", () => {
    const config = makeConfig({ mode: "keyValue" });
    const result = derivePermissionOptions([config]);
    const modelPerms = result.filter((o) => o.value.startsWith("post:"));
    expect(modelPerms).toHaveLength(2);
    expect(modelPerms.map((p) => p.value)).toEqual(["post:view", "post:update"]);
  });

  it("appends extraPermissions", () => {
    const extras = [{ value: "custom:run", label: "Custom — Run" }];
    const result = derivePermissionOptions([], extras);
    const custom = result.filter((o) => o.value === "custom:run");
    expect(custom).toHaveLength(1);
    expect(custom[0].label).toBe("Custom — Run");
  });

  it("handles multiple configs", () => {
    const configs = [
      makeConfig({ model: "post", label: "Posts" }),
      makeConfig({ model: "user", label: "Users" }),
    ];
    const result = derivePermissionOptions(configs);
    const postPerms = result.filter((o) => o.value.startsWith("post:"));
    const userPerms = result.filter((o) => o.value.startsWith("user:"));
    expect(postPerms).toHaveLength(4);
    expect(userPerms).toHaveLength(4);
  });

  it("uses config.label in permission label", () => {
    const config = makeConfig({ label: "Blog Posts" });
    const result = derivePermissionOptions([config]);
    const perm = result.find((o) => o.value === "post:view");
    expect(perm?.label).toBe("Blog Posts — View");
  });

  it("returns wildcard + model + extras combined", () => {
    const config = makeConfig();
    const extras = [{ value: "x:y", label: "X — Y" }];
    const result = derivePermissionOptions([config], extras);
    // 4 wildcard + 4 model + 1 extra
    expect(result).toHaveLength(9);
  });
});
