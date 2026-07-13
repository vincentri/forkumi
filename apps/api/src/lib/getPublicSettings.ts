import { prisma } from "@repo/db";
import { createGetPublicSettings } from "@repo/admin/server";
import { cache } from "react";

export const getPublicSettings = cache(
  createGetPublicSettings(prisma, [], { namespace: "branding" }),
);
