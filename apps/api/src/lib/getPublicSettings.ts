import { prisma } from "@repo/db";
import { createGetPublicSettings } from "@repo/admin/server";

export const getPublicSettings = createGetPublicSettings(prisma, [], { namespace: "branding" });
