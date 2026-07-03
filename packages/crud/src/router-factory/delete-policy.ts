import { TRPCError } from "@trpc/server";
import type { CRUDConfig, CRUDDeletePolicy } from "../types";
import { prismaModelKey } from "./relations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function applyDeletePolicies(db: any, config: CRUDConfig, ids: string[]): Promise<void> {
  const policies = config.deletePolicy ?? [];
  if (policies.length === 0) return;

  for (const policy of policies) {
    if (policy.onDelete !== "restrict") continue;
    const referencingModel = prismaModelKey(policy.referencingModel);
    for (const id of ids) {
      const relatedCount = await db[referencingModel].count({
        where: { [policy.referencingField]: id },
      });
      if (relatedCount > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: policy.message ?? `Cannot delete this ${config.label.toLowerCase()} because it is still in use.`,
        });
      }
    }
  }

  for (const policy of policies) {
    await applyReferencingUpdate(db, config, policy, ids);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyReferencingUpdate(db: any, config: CRUDConfig, policy: CRUDDeletePolicy, ids: string[]): Promise<void> {
  if (policy.onDelete === "restrict" || policy.onDelete === "ignore") return;
  if (policy.onDelete === "setValue" && policy.value === undefined) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `deletePolicy for "${config.model}" requires value when onDelete is "setValue".`,
    });
  }

  const referencingModel = prismaModelKey(policy.referencingModel);
  const nextValue = policy.onDelete === "setNull" ? null : policy.value;
  for (const id of ids) {
    await db[referencingModel].updateMany({
      where: { [policy.referencingField]: id },
      data: { [policy.referencingField]: nextValue },
    });
  }
}
