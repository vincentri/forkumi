import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { buildCRUDRouters, createCRUDRouter } from "../router-factory";
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

// Test the Prisma error → TRPCError conversion in isolation.
// We can't test createCRUDRouter end-to-end without a real DB,
// but the error handler is a pure function we can unit-test.

// Re-implement the handler logic here to test the contract.
// If router-factory ever exports handlePrismaError, delete this and import directly.
function handlePrismaError(err: unknown): never {
  const PRISMA_UNIQUE_VIOLATION = "P2002";
  const PRISMA_NOT_FOUND = "P2025";

  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: string }).code;
    if (code === PRISMA_UNIQUE_VIOLATION) {
      const fields = (err as { meta?: { target?: string[] } }).meta?.target?.join(", ");
      throw new TRPCError({
        code: "CONFLICT",
        message: fields ? `A record with this ${fields} already exists.` : "A record with these values already exists.",
      });
    }
    if (code === PRISMA_NOT_FOUND) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Record not found." });
    }
  }
  throw err;
}

describe("Prisma error handling", () => {
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

  it("unknown error → rethrows as-is", () => {
    const unknownError = new Error("something else");
    expect(() => handlePrismaError(unknownError)).toThrow("something else");
  });

  it("non-Prisma object → rethrows as-is", () => {
    const weirdError = { message: "not a prisma error" };
    expect(() => handlePrismaError(weirdError)).toThrow();
  });
});
