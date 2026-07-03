import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { buildCRUDRouters, createCRUDRouter, createKeyValueRouter, handlePrismaError } from "../router-factory";
import type { CRUDConfig } from "../types";

// --- buildCRUDRouters ---

function makeConfig(model: string): CRUDConfig {
  return {
    model,
    label: model,
    fields: [{ name: "title", type: "text", label: "Title", required: true }],
  };
}

// Minimal stubs so we can test route key registration without real tRPC/Prisma
function stubRouter(procedures: Record<string, unknown>) {
  return { _type: "router", procedures };
}

const stubProcedure = {
  input: () => stubProcedure,
  query: () => "query",
  mutation: () => "mutation",
  use: () => stubProcedure,
};

const stubPrisma = {};

function realRouter(procedures: Record<string, unknown>) {
  return procedures;
}

const realProcedure: any = {
  input: () => realProcedure,
  query: (fn: Function) => ({ _queryFn: fn }),
  mutation: (fn: Function) => ({ _mutationFn: fn }),
  use: () => realProcedure,
};

describe("buildCRUDRouters", () => {
  it("returns empty object for empty configs", () => {
    const result = buildCRUDRouters({}, stubRouter as any, stubProcedure as any, stubPrisma);
    expect(result).toEqual({});
  });

  it("uses config.model as the tRPC route key (not the export name)", () => {
    const result = buildCRUDRouters(
      { PostCRUD: makeConfig("post") },
      stubRouter as any,
      stubProcedure as any,
      stubPrisma,
    );
    expect(Object.keys(result)).toEqual(["post"]);
    expect(result["PostCRUD"]).toBeUndefined();
  });

  it("registers multiple configs under their respective model keys", () => {
    const result = buildCRUDRouters(
      {
        PostCRUD: makeConfig("post"),
        ProductCRUD: makeConfig("product"),
      },
      stubRouter as any,
      stubProcedure as any,
      stubPrisma,
    );
    expect(Object.keys(result).sort()).toEqual(["post", "product"]);
  });

  it("camelCase model key passes through unchanged (slug conversion is caller's job)", () => {
    const result = buildCRUDRouters(
      { BlogPostCRUD: makeConfig("blogPost") },
      stubRouter as any,
      stubProcedure as any,
      stubPrisma,
    );
    expect(Object.keys(result)).toEqual(["blogPost"]);
  });
});

// --- field filters ---

describe("createCRUDRouter field filters", () => {
  it("does not apply global text search by default", async () => {
    const capturedWhere: unknown[] = [];
    const mockPrisma = {
      user: {
        findMany: (args: { where: unknown }) => { capturedWhere.push(args.where); return []; },
        count: () => 0,
      },
    };

    const config: CRUDConfig = {
      model: "user",
      label: "Users",
      fields: [
        { name: "email", type: "email", label: "Email", required: true, filterable: true },
        { name: "password", type: "password", label: "Password", required: true },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await (routerResult as any).list._queryFn({ input: { page: 1, pageSize: 20, search: "test" } });

    expect(capturedWhere).toHaveLength(1);
    expect(capturedWhere[0]).toEqual({});
  });

  it("applies text filters only for filterable fields", async () => {
    const capturedWhere: unknown[] = [];
    const mockPrisma = {
      user: {
        findMany: (args: { where: unknown }) => { capturedWhere.push(args.where); return []; },
        count: () => 0,
      },
    };

    const config: CRUDConfig = {
      model: "user",
      label: "Users",
      fields: [
        { name: "email", type: "email", label: "Email", required: true },
        { name: "name", type: "text", label: "Name", filterable: false },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await (routerResult as any).list._queryFn({
      input: {
        page: 1,
        pageSize: 20,
        filters: { email: "test", name: "ignored" },
      },
    });

    expect(capturedWhere).toHaveLength(1);
    expect(capturedWhere[0]).toEqual({
      AND: [{ email: { contains: "test", mode: "insensitive" } }],
    });
  });

  it("never filters password fields even though filtering defaults to enabled", async () => {
    const capturedWhere: unknown[] = [];
    const mockPrisma = {
      user: {
        findMany: (args: { where: unknown }) => { capturedWhere.push(args.where); return []; },
        count: () => 0,
      },
    };

    const config: CRUDConfig = {
      model: "user",
      label: "Users",
      fields: [
        { name: "email", type: "email", label: "Email", required: true },
        { name: "password", type: "password", label: "Password", required: true },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await (routerResult as any).list._queryFn({
      input: {
        page: 1,
        pageSize: 20,
        filters: { email: "test", password: "secret" },
      },
    });

    expect(capturedWhere[0]).toEqual({
      AND: [{ email: { contains: "test", mode: "insensitive" } }],
    });
  });

  it("update preserves explicit slug values", async () => {
    const calls: unknown[] = [];
    const mockPrisma = {
      post: {
        update: async (args: unknown) => {
          calls.push(args);
          return args;
        },
      },
    };

    const config: CRUDConfig = {
      model: "post",
      label: "Posts",
      fields: [
        { name: "title", type: "text", label: "Title", required: true },
        { name: "slug", type: "text", label: "Slug", required: true, slugFrom: "title" },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await (routerResult as any).update._mutationFn({
      input: { id: "post_1", data: { title: "New Title", slug: "manual-slug" } },
    });

    expect(calls[0]).toEqual({ where: { id: "post_1" }, data: { title: "New Title", slug: "manual-slug" } });
  });
});

describe("createCRUDRouter exportCsv", () => {
  it("exports filtered rows without pagination and omits password fields", async () => {
    const capturedArgs: unknown[] = [];
    const mockPrisma = {
      user: {
        findMany: (args: unknown) => {
          capturedArgs.push(args);
          return [
            { email: "a@example.com", role: "admin", password: "secret" },
            { email: "b@example.com", role: "user", password: "secret" },
          ];
        },
      },
    };

    const config: CRUDConfig = {
      model: "user",
      label: "Users",
      fields: [
        { name: "email", type: "email", label: "Email", required: true },
        {
          name: "role",
          type: "select",
          label: "Role",
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        },
        { name: "password", type: "password", label: "Password", required: true },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).exportCsv._mutationFn({
      input: {
        sortField: "email",
        sortDir: "asc",
        filters: { email: "example" },
      },
    });

    expect(capturedArgs[0]).toEqual({
      where: { AND: [{ email: { contains: "example", mode: "insensitive" } }] },
      orderBy: { email: "asc" },
    });
    expect(result.csv).toBe("Email,Role\na@example.com,Admin\nb@example.com,User");
  });
});

describe("createCRUDRouter deletePolicy", () => {
  function makeDeletePolicyConfig(deletePolicy: CRUDConfig["deletePolicy"]): CRUDConfig {
    return {
      model: "category",
      label: "Category",
      deletePolicy,
      fields: [{ name: "title", type: "text", label: "Title", required: true }],
    };
  }

  it("restrict blocks delete with a clear message", async () => {
    const mockPrisma = {
      category: {
        delete: async () => ({ id: "cat_1" }),
        deleteMany: async () => ({ count: 1 }),
      },
      post: {
        count: async () => 2,
        updateMany: async () => ({ count: 0 }),
      },
    };
    const config = makeDeletePolicyConfig([
      {
        referencingModel: "post",
        referencingField: "categoryId",
        onDelete: "restrict",
        message: "Cannot delete category while posts are using it.",
      },
    ]);
    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure, mockPrisma);

    await expect((routerResult as any).delete._mutationFn({ input: { id: "cat_1" } })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Cannot delete category while posts are using it.",
    });
  });

  it("restrict allows delete when no rows reference the record", async () => {
    const calls: unknown[] = [];
    const mockPrisma = {
      category: {
        delete: async (args: unknown) => {
          calls.push(["delete", args]);
          return { id: "cat_1" };
        },
        deleteMany: async () => ({ count: 0 }),
      },
      post: {
        count: async (args: unknown) => {
          calls.push(["count", args]);
          return 0;
        },
        updateMany: async () => ({ count: 0 }),
      },
    };
    const config = makeDeletePolicyConfig([
      { referencingModel: "post", referencingField: "categoryId", onDelete: "restrict" },
    ]);
    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure, mockPrisma);

    await expect((routerResult as any).delete._mutationFn({ input: { id: "cat_1" } })).resolves.toEqual({ id: "cat_1" });
    expect(calls).toEqual([
      ["count", { where: { categoryId: "cat_1" } }],
      ["delete", { where: { id: "cat_1" } }],
    ]);
  });

  it("setNull updates referencing rows before delete", async () => {
    const calls: unknown[] = [];
    const mockPrisma = {
      category: {
        delete: async (args: unknown) => {
          calls.push(["delete", args]);
          return { id: "cat_1" };
        },
        deleteMany: async () => ({ count: 0 }),
      },
      post: {
        count: async () => 0,
        updateMany: async (args: unknown) => {
          calls.push(["updateMany", args]);
          return { count: 2 };
        },
      },
    };
    const config = makeDeletePolicyConfig([
      { referencingModel: "post", referencingField: "categoryId", onDelete: "setNull" },
    ]);
    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure, mockPrisma);

    await (routerResult as any).delete._mutationFn({ input: { id: "cat_1" } });
    expect(calls).toEqual([
      ["updateMany", { where: { categoryId: "cat_1" }, data: { categoryId: null } }],
      ["delete", { where: { id: "cat_1" } }],
    ]);
  });

  it("setValue updates referencing rows before delete", async () => {
    const calls: unknown[] = [];
    const mockPrisma = {
      category: {
        delete: async (args: unknown) => {
          calls.push(["delete", args]);
          return { id: "cat_1" };
        },
        deleteMany: async () => ({ count: 0 }),
      },
      post: {
        count: async () => 0,
        updateMany: async (args: unknown) => {
          calls.push(["updateMany", args]);
          return { count: 2 };
        },
      },
    };
    const config = makeDeletePolicyConfig([
      { referencingModel: "post", referencingField: "categoryId", onDelete: "setValue", value: "fallback_cat" },
    ]);
    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure, mockPrisma);

    await (routerResult as any).delete._mutationFn({ input: { id: "cat_1" } });
    expect(calls).toEqual([
      ["updateMany", { where: { categoryId: "cat_1" }, data: { categoryId: "fallback_cat" } }],
      ["delete", { where: { id: "cat_1" } }],
    ]);
  });

  it("ignore preserves current delete behavior", async () => {
    const calls: unknown[] = [];
    const mockPrisma = {
      category: {
        delete: async (args: unknown) => {
          calls.push(["delete", args]);
          return { id: "cat_1" };
        },
        deleteMany: async () => ({ count: 0 }),
      },
      post: {
        count: async (args: unknown) => {
          calls.push(["count", args]);
          return 0;
        },
        updateMany: async (args: unknown) => {
          calls.push(["updateMany", args]);
          return { count: 0 };
        },
      },
    };
    const config = makeDeletePolicyConfig([
      { referencingModel: "post", referencingField: "categoryId", onDelete: "ignore" },
    ]);
    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure, mockPrisma);

    await (routerResult as any).delete._mutationFn({ input: { id: "cat_1" } });
    expect(calls).toEqual([["delete", { where: { id: "cat_1" } }]]);
  });

  it("bulkDelete follows delete policy rules", async () => {
    const calls: unknown[] = [];
    const mockPrisma = {
      category: {
        delete: async () => ({ id: "cat_1" }),
        deleteMany: async (args: unknown) => {
          calls.push(["deleteMany", args]);
          return { count: 2 };
        },
      },
      post: {
        count: async () => 0,
        updateMany: async (args: unknown) => {
          calls.push(["updateMany", args]);
          return { count: 1 };
        },
      },
    };
    const config = makeDeletePolicyConfig([
      { referencingModel: "post", referencingField: "categoryId", onDelete: "setNull" },
    ]);
    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure, mockPrisma);

    await expect((routerResult as any).bulkDelete._mutationFn({ input: { ids: ["cat_1", "cat_2"] } })).resolves.toEqual({ count: 2 });
    expect(calls).toEqual([
      ["updateMany", { where: { categoryId: "cat_1" }, data: { categoryId: null } }],
      ["updateMany", { where: { categoryId: "cat_2" }, data: { categoryId: null } }],
      ["deleteMany", { where: { id: { in: ["cat_1", "cat_2"] } } }],
    ]);
  });
});

// --- handlePrismaError ---

// Import the real function instead of re-implementing
describe("Prisma error handling (imported handlePrismaError)", () => {
  it("P2002 with target fields → CONFLICT with field names in message", () => {
    const prismaError = { code: "P2002", meta: { target: ["email"] } };
    expect(() => handlePrismaError(prismaError)).toThrowError(TRPCError);
    try {
      handlePrismaError(prismaError);
    } catch (err) {
      expect((err as TRPCError).code).toBe("CONFLICT");
      expect((err as TRPCError).message).toContain("email");
    }
  });

  it("P2002 without target → generic CONFLICT message", () => {
    const prismaError = { code: "P2002" };
    try {
      handlePrismaError(prismaError);
    } catch (err) {
      expect((err as TRPCError).code).toBe("CONFLICT");
      expect((err as TRPCError).message).toContain("already exists");
    }
  });

  it("P2025 → NOT_FOUND", () => {
    const prismaError = { code: "P2025" };
    try {
      handlePrismaError(prismaError);
    } catch (err) {
      expect((err as TRPCError).code).toBe("NOT_FOUND");
    }
  });

  it("TRPCError passthrough — rethrows without wrapping", () => {
    const trpcErr = new TRPCError({ code: "FORBIDDEN", message: "No access" });
    expect(() => handlePrismaError(trpcErr)).toThrow(trpcErr);
  });

  it("generic non-Prisma error → INTERNAL_SERVER_ERROR", () => {
    const unknownError = new Error("something else");
    try {
      handlePrismaError(unknownError);
    } catch (err) {
      expect((err as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
      expect((err as TRPCError).message).toBe("Something went wrong. Please try again.");
    }
  });

  it("non-Prisma object → INTERNAL_SERVER_ERROR", () => {
    const weirdError = { message: "not a prisma error" };
    try {
      handlePrismaError(weirdError);
    } catch (err) {
      expect((err as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("null → INTERNAL_SERVER_ERROR", () => {
    try {
      handlePrismaError(null);
    } catch (err) {
      expect((err as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("undefined → INTERNAL_SERVER_ERROR", () => {
    try {
      handlePrismaError(undefined);
    } catch (err) {
      expect((err as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});

// --- createKeyValueRouter ---

describe("createKeyValueRouter", () => {
  it("get returns key-value pairs from DB", async () => {
    const mockPrisma = {
      setting: {
        findMany: async () => [
          { key: "heading", value: "Hello" },
          { key: "body", value: "World" },
        ],
      },
    };

    const config: CRUDConfig = {
      model: "setting",
      label: "Settings",
      mode: "keyValue",
      fields: [
        { name: "heading", type: "text", label: "Heading", namespace: "about" },
        { name: "body", type: "text", label: "Body", namespace: "about" },
      ],
    };

    const routerResult = createKeyValueRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).get._queryFn();
    expect(result).toEqual({ heading: "Hello", body: "World" });
  });

  it("get returns empty string for null values", async () => {
    const mockPrisma = {
      setting: {
        findMany: async () => [
          { key: "heading", value: null },
        ],
      },
    };

    const config: CRUDConfig = {
      model: "setting",
      label: "Settings",
      mode: "keyValue",
      fields: [
        { name: "heading", type: "text", label: "Heading", namespace: "about" },
      ],
    };

    const routerResult = createKeyValueRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).get._queryFn();
    expect(result).toEqual({ heading: "" });
  });

  it("update upserts each key with correct namespace", async () => {
    const calls: unknown[] = [];
    const mockPrisma = {
      setting: {
        findMany: async () => [{ key: "heading", value: "Old" }],
        upsert: async (args: unknown) => {
          calls.push(args);
          return args;
        },
      },
    };

    const config: CRUDConfig = {
      model: "setting",
      label: "Settings",
      mode: "keyValue",
      fields: [
        { name: "heading", type: "text", label: "Heading", namespace: "about" },
      ],
    };

    const routerResult = createKeyValueRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await (routerResult as any).update._mutationFn({ input: { data: { heading: "New" } } });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      where: { key: "heading" },
      update: { namespace: "about", value: "New" },
      create: { key: "heading", namespace: "about", value: "New" },
    });
  });

  it("searchOptions returns options for select fields with optionsQuery", async () => {
    const mockPrisma = {};
    const config: CRUDConfig = {
      model: "setting",
      label: "Settings",
      mode: "keyValue",
      fields: [
        {
          name: "theme",
          type: "select",
          label: "Theme",
          namespace: "about",
          optionsQuery: async () => [
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ],
        },
      ],
    };

    const routerResult = createKeyValueRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).searchOptions._queryFn({
      input: { field: "theme" },
    });
    expect(result).toEqual([
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ]);
  });

  it("searchOptions throws BAD_REQUEST for non-select field", async () => {
    const mockPrisma = {};
    const config: CRUDConfig = {
      model: "setting",
      label: "Settings",
      mode: "keyValue",
      fields: [
        { name: "heading", type: "text", label: "Heading", namespace: "about" },
      ],
    };

    const routerResult = createKeyValueRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await expect(
      (routerResult as any).searchOptions._queryFn({ input: { field: "heading" } }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("searchOptions throws BAD_REQUEST for unknown field", async () => {
    const mockPrisma = {};
    const config: CRUDConfig = {
      model: "setting",
      label: "Settings",
      mode: "keyValue",
      fields: [
        { name: "heading", type: "text", label: "Heading", namespace: "about" },
      ],
    };

    const routerResult = createKeyValueRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await expect(
      (routerResult as any).searchOptions._queryFn({ input: { field: "nonexistent" } }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// --- searchOptions with ids ---

describe("createCRUDRouter searchOptions with ids", () => {
  it("returns labels when only ids are provided", async () => {
    const mockPrisma = {
      category: {
        findMany: async (args: { where: Record<string, unknown> }) => {
          const ids = args.where.id?.in ?? [];
          return ids.map((id: string) => ({ id, name: `Category ${id}` }));
        },
      },
    };

    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        {
          name: "categoryId",
          type: "select",
          label: "Category",
          optionsFrom: {
            model: "category",
            valueField: "id",
            labelField: "name",
          },
        },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).searchOptions._queryFn({
      input: { field: "categoryId", ids: ["1", "2"] },
    });
    expect(result).toEqual([
      { value: "1", label: "Category 1" },
      { value: "2", label: "Category 2" },
    ]);
  });

  it("deduplicates results across ids and search", async () => {
    const callCount = { search: 0, ids: 0 };
    const mockPrisma = {
      category: {
        findMany: async (args: { where: Record<string, unknown> }) => {
          if (args.where.OR) {
            callCount.search++;
            return [{ id: "1", name: "Cat 1" }];
          }
          if (args.where.id) {
            callCount.ids++;
            return [{ id: "1", name: "Cat 1" }];
          }
          return [];
        },
      },
    };

    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        {
          name: "categoryId",
          type: "select",
          label: "Category",
          optionsFrom: {
            model: "category",
            valueField: "id",
            labelField: "name",
          },
        },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).searchOptions._queryFn({
      input: { field: "categoryId", ids: ["1"], search: "Cat" },
    });
    // Should deduplicate — only one result for id "1"
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ value: "1", label: "Cat 1" });
  });
});

// --- createCRUDRouter searchOptions for static options ---

describe("createCRUDRouter searchOptions for static options", () => {
  it("filters static options by search term", async () => {
    const mockPrisma = {};
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ],
        },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).searchOptions._queryFn({
      input: { field: "status", search: "pub" },
    });
    expect(result).toEqual([{ value: "published", label: "Published" }]);
  });

  it("returns all static options when no search term", async () => {
    const mockPrisma = {};
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ],
        },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).searchOptions._queryFn({
      input: { field: "status" },
    });
    expect(result).toHaveLength(2);
  });
});

// --- createCRUDRouter CSV export with select labels ---

describe("createCRUDRouter exportCsv select label resolution", () => {
  it("resolves select option labels in CSV output", async () => {
    const mockPrisma = {
      product: {
        findMany: async () => [
          { name: "Widget", status: "draft" },
        ],
      },
    };

    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        { name: "name", type: "text", label: "Name" },
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ],
        },
      ],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    const result = await (routerResult as any).exportCsv._mutationFn({ input: {} });
    expect(result.csv).toBe("Name,Status\nWidget,Draft");
  });
});

// --- createCRUDRouter readOnly mode ---

describe("createCRUDRouter readOnly mode", () => {
  it("only exposes list and getById when readOnly is true", () => {
    const mockPrisma = {};
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      readOnly: true,
      fields: [{ name: "title", type: "text", label: "Title" }],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    expect((routerResult as any).list).toBeDefined();
    expect((routerResult as any).getById).toBeDefined();
    expect((routerResult as any).create).toBeUndefined();
    expect((routerResult as any).update).toBeUndefined();
    expect((routerResult as any).delete).toBeUndefined();
    expect((routerResult as any).bulkDelete).toBeUndefined();
  });
});

// --- createCRUDRouter maxRecords ---

describe("createCRUDRouter maxRecords", () => {
  it("blocks create when maxRecords is reached", async () => {
    const mockPrisma = {
      product: {
        count: async () => 10,
      },
    };

    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      maxRecords: 10,
      fields: [{ name: "title", type: "text", label: "Title", required: true }],
    };

    const routerResult = createCRUDRouter(config, realRouter as any, realProcedure as any, mockPrisma);
    await expect(
      (routerResult as any).create._mutationFn({ input: { title: "New" } }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Maximum of 10 products allowed.",
    });
  });
});
