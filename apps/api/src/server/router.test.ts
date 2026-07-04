import { describe, it, expect } from "vitest";
import { FrontPageSettingsCRUD } from "~/crud/frontPageSetting";
import { buildThreadedComments } from "~/lib/thread-comments";
import { BOT_MIN_SUBMIT_MS, isBotSubmission } from "./bot-guard";

// Replicate the keysForNamespace logic from router.ts
function keysForNamespace(namespace: string): string[] {
  return FrontPageSettingsCRUD.fields
    .filter((f) => f.namespace === namespace)
    .map((f) => f.name);
}

describe("keysForNamespace", () => {
  it("returns field names for 'general' namespace", () => {
    const keys = keysForNamespace("general");
    expect(keys).toContain("logo");
    expect(keys).toContain("favicon");
    expect(keys).toContain("site_name");
    expect(keys).toContain("search_placeholder");
    expect(keys).toContain("footer_motto");
    expect(keys).toContain("footer_copyright");
  });

  it("returns field names for 'contact' namespace", () => {
    const keys = keysForNamespace("contact");
    expect(keys).toContain("feedback_section_title");
    expect(keys).toContain("feedback_section_pin_blog_id");
    expect(keys).toContain("feedback_section_content");
    expect(keys).toContain("feedback_section_by");
  });

  it("returns field names for 'seo' namespace", () => {
    const keys = keysForNamespace("seo");
    expect(keys.length).toBeGreaterThan(0);
    // All returned keys should be strings
    keys.forEach((key) => expect(typeof key).toBe("string"));
  });

  it("returns empty array for unknown namespace", () => {
    const keys = keysForNamespace("nonexistent");
    expect(keys).toEqual([]);
  });

  it("returns only fields matching the requested namespace", () => {
    const generalKeys = keysForNamespace("general");
    const contactKeys = keysForNamespace("contact");
    // No overlap between namespaces
    const overlap = generalKeys.filter((k) => contactKeys.includes(k));
    expect(overlap).toEqual([]);
  });

  it("all fields have a namespace property", () => {
    const allFields = FrontPageSettingsCRUD.fields;
    const fieldsWithoutNamespace = allFields.filter((f) => !f.namespace);
    expect(fieldsWithoutNamespace).toEqual([]);
  });
});

describe("buildThreadedComments", () => {
  it("groups replies under their root comment", () => {
    const comments = [
      { id: "root1", parentId: null, content: "Root", createdAt: "2026-04-08T10:00:00Z" },
      { id: "reply1", parentId: "root1", content: "Reply A", createdAt: "2026-04-08T11:00:00Z" },
      { id: "reply2", parentId: "root1", content: "Reply B", createdAt: "2026-04-08T12:00:00Z" },
    ];
    const tree = buildThreadedComments(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("root1");
    expect(tree[0].replies.map((r) => r.id)).toEqual(["reply2", "reply1"]);
  });

  it("keeps roots without replies empty", () => {
    const comments = [{ id: "root1", parentId: null, content: "Root", createdAt: "2026-04-08T10:00:00Z" }];
    const tree = buildThreadedComments(comments);
    expect(tree[0].replies).toEqual([]);
  });

  it("ignores replies whose parent is not in the list", () => {
    const comments = [
      { id: "root1", parentId: null, content: "Root", createdAt: "2026-04-08T10:00:00Z" },
      { id: "reply1", parentId: "missing", content: "Orphan", createdAt: "2026-04-08T11:00:00Z" },
    ];
    const tree = buildThreadedComments(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].replies).toEqual([]);
  });

  it("does not nest deeper than one level", () => {
    const comments = [
      { id: "root1", parentId: null, content: "Root", createdAt: "2026-04-08T10:00:00Z" },
      { id: "reply1", parentId: "root1", content: "Reply", createdAt: "2026-04-08T11:00:00Z" },
      { id: "nested", parentId: "reply1", content: "Nested", createdAt: "2026-04-08T12:00:00Z" },
    ];
    const tree = buildThreadedComments(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].id).toBe("reply1");
    expect(tree.some((r) => r.id === "nested")).toBe(false);
  });

  it("sorts roots and replies by createdAt desc", () => {
    const comments = [
      { id: "root1", parentId: null, content: "Older root", createdAt: "2026-04-07T10:00:00Z" },
      { id: "root2", parentId: null, content: "Newer root", createdAt: "2026-04-08T10:00:00Z" },
      { id: "reply1", parentId: "root1", content: "Older reply", createdAt: "2026-04-07T11:00:00Z" },
      { id: "reply2", parentId: "root1", content: "Newer reply", createdAt: "2026-04-07T12:00:00Z" },
    ];
    const tree = buildThreadedComments(comments);
    expect(tree.map((r) => r.id)).toEqual(["root2", "root1"]);
    expect(tree[1].replies.map((r) => r.id)).toEqual(["reply2", "reply1"]);
  });
});

describe("isBotSubmission", () => {
  it("flags filled honeypot fields", () => {
    expect(isBotSubmission({ website: "https://spam.example", _t: 1_000 }, 10_000)).toBe(true);
  });

  it("flags submissions faster than the minimum time", () => {
    expect(isBotSubmission({ website: "", _t: 10_000 }, 10_000 + BOT_MIN_SUBMIT_MS - 1)).toBe(true);
  });

  it("flags submissions without a valid mount timestamp", () => {
    expect(isBotSubmission({ website: "" }, 10_000)).toBe(true);
    expect(isBotSubmission({ website: "", _t: 0 }, 10_000)).toBe(true);
  });

  it("allows empty honeypot and slow submissions", () => {
    expect(isBotSubmission({ website: "", _t: 10_000 }, 10_000 + BOT_MIN_SUBMIT_MS)).toBe(false);
  });
});
