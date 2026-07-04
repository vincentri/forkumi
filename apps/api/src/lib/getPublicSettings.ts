import { prisma } from "~/lib/db";
import { createGetPublicSettings } from "@repo/admin/server";
import { cache } from "react";

export const getPublicSettings = cache(
  createGetPublicSettings(prisma, [], { namespace: "branding" }),
);
