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

// --- searchableFields security: password type must never be searched ---

describe("createCRUDRouter searchableFields", () => {
  it("does not include password-type fields in text search", async () => {
    const capturedWhere: unknown[] = [];
    const mockPrisma = {
      user: {
        findMany: (args: { where: unknown }) => { capturedWhere.push(args.where); return []; },
        count: () => 0,
      },
    };

    // Real tRPC-like stubs that actually execute the query fn
    function realRouter(procedures: Record<string, unknown>) {
      return procedures;
    }
    const realProcedure = {
      input: (_schema: unknown) => ({
        query: (fn: Function) => ({ _queryFn: fn }),
        mutation: (fn: Function) => ({ _mutationFn: fn }),
      }),
      use: () => realProcedure,
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
    // Execute the list query with a search term
    await (routerResult as any).list._queryFn({ input: { page: 1, pageSize: 20, search: "test" } });

    // The where clause must only contain email, not password
    expect(capturedWhere).toHaveLength(1);
    const where = capturedWhere[0] as { OR?: { [key: string]: unknown }[] };
    expect(where.OR).toBeDefined();
    const searchedFields = where.OR!.map((clause) => Object.keys(clause)[0]);
    expect(searchedFields).toContain("email");
    expect(searchedFields).not.toContain("password");
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
