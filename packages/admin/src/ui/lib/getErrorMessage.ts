import { TRPCClientError } from "@trpc/client";

export function getErrorMessage(err: unknown): string {
  if (err instanceof TRPCClientError) {
    try {
      const issues = JSON.parse(err.message);
      if (Array.isArray(issues) && issues[0]?.message) return issues[0].message;
    } catch {
      // not JSON — fall through
    }
    return err.message;
  }
  return (err as Error)?.message ?? "Something went wrong";
}
