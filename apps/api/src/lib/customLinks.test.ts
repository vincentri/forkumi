import { describe, expect, it } from "vitest";
import { customLinks } from "./customLinks";

describe("customLinks", () => {
  it("does not register app-specific links in the core template", () => {
    expect(customLinks).toEqual([]);
  });
});
