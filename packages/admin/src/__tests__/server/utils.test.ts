import { describe, it, expect } from "vitest";
import { sha256 } from "../../server/utils";

describe("sha256", () => {
  it("returns hex string", () => {
    const result = sha256("hello");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic", () => {
    expect(sha256("test")).toBe(sha256("test"));
  });

  it("produces different hashes for different inputs", () => {
    expect(sha256("a")).not.toBe(sha256("b"));
  });

  it("hashes empty string", () => {
    const result = sha256("");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
    expect(result).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });
});
