import { TRPCError } from "@trpc/server";

/** Prisma error codes we handle explicitly */
const PRISMA_UNIQUE_VIOLATION = "P2002";
const PRISMA_NOT_FOUND = "P2025";

/**
 * Translate a Prisma error into a TRPCError with a user-safe message.
 * Never leak raw Prisma error text to clients.
 */
export function handlePrismaError(err: unknown): never {
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
  if (err instanceof TRPCError) throw err;
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong. Please try again." });
}
