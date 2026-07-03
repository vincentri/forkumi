import { describe, it, expect } from "vitest";
import { cn } from "../../lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false, null, undefined, "", 0)).toBe("foo");
  });

  it("handles no arguments", () => {
    expect(cn()).toBe("");
  });

  it("flattens arrays", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("handles objects with boolean values", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });
});
