import { prisma } from "@repo/db";
import { buildCRUDRouters, z } from "@repo/crud";
import { router, publicProcedure, permissionProcedure } from "./trpc";
import * as CRUDConfigs from "~/crud";
import { userRouter } from "./routers/user";
import { roleCreateProcedure, roleUpdateProcedure, roleDeleteProcedure } from "./routers/role";
import { getInvitationProcedure, acceptInvitationProcedure } from "./routers/invitation";
import { accountRouter } from "./routers/account";
import { emailSettingsRouter } from "./routers/emailSettings";
import { FrontPageSettingsCRUD } from "~/crud/frontPageSetting";
import { deleteManagedAsset } from "~/lib/delete-managed-asset";

type ContentRow = { key: string; value: string | null };
type PageRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
type BlogRow = PageRow & {
  description: string;
  image: string | null;
};
type FrontPageSettingsDelegate = {
  findMany: (args: {
    where: {
      OR: Array<
        | { namespace: string }
        | { namespace: null; key: { in: string[] } }
      >;
    };
  }) => Promise<ContentRow[]>;
};
type PageDelegate = {
  findMany: (args: {
    where: { status: string };
    orderBy: { createdAt: "asc" | "desc" };
    select?: Record<string, boolean>;
  }) => Promise<PageRow[]>;
  findFirst: (args: { where: { slug: string; status: string } }) => Promise<PageRow | null>;
};
type BlogDelegate = {
  findMany: (args: {
    where: { status: string; slug?: { not: string } };
    orderBy: { createdAt: "asc" | "desc" };
    skip?: number;
    take?: number;
  }) => Promise<BlogRow[]>;
  findFirst: (args: { where: { slug: string; status: string } }) => Promise<BlogRow | null>;
  count: (args: { where: { status: string } }) => Promise<number>;
};

const db = prisma as unknown as {
  frontPageSettings: FrontPageSettingsDelegate;
  page: PageDelegate;
  blog: BlogDelegate;
};

function keysForNamespace(namespace: string): string[] {
  return FrontPageSettingsCRUD.fields
    .filter((f) => f.namespace === namespace)
    .map((f) => f.name);
}

const procedureMapFactory = (config: import("@repo/crud").CRUDConfig) => ({
  list:    permissionProcedure("view",   config.model),
  getById: permissionProcedure("read",   config.model),
  create:  permissionProcedure("create", config.model),
  update:  permissionProcedure("update", config.model),
  delete:  permissionProcedure("delete", config.model),
});

const crudRouters = buildCRUDRouters(
  CRUDConfigs as Record<string, import("@repo/crud").CRUDConfig>,
  router,
  procedureMapFactory,
  prisma,
  {
    onAssetReplaced: ({ oldValue }) => deleteManagedAsset(oldValue),
  },
);

crudRouters.user = userRouter;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const autoRole = crudRouters.role as any;
crudRouters.role = router({
  list:    autoRole.list,
  getById: autoRole.getById,
  create:  roleCreateProcedure,
  update:  roleUpdateProcedure,
  delete:  roleDeleteProcedure,
});

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  public: router({
    getInvitation:    getInvitationProcedure,
    acceptInvitation: acceptInvitationProcedure,
    getContent: publicProcedure
      .input(z.object({ namespace: z.string() }))
      .query(async ({ input }) => {
        const keys = keysForNamespace(input.namespace);
        const rows = await db.frontPageSettings.findMany({
          where: {
            OR: [
              { namespace: input.namespace },
              ...(keys.length > 0 ? [{ namespace: null, key: { in: keys } }] : []),
            ],
          },
        });
        return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
      }),
    getPages: publicProcedure.query(() =>
      db.page.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, slug: true, content: true, status: true, createdAt: true, updatedAt: true },
      }),
    ),
    getPageBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(({ input }) => db.page.findFirst({ where: { slug: input.slug, status: "published" } })),
    getBlogPosts: publicProcedure.query(() =>
      db.blog.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
      }),
    ),
    getBlogPostsPaginated: publicProcedure
      .input(z.object({ page: z.number().min(1), perPage: z.number().min(1).max(24) }))
      .query(async ({ input }) => {
        const [posts, total] = await Promise.all([
          db.blog.findMany({
            where: { status: "published" },
            orderBy: { createdAt: "desc" },
            skip: (input.page - 1) * input.perPage,
            take: input.perPage,
          }),
          db.blog.count({ where: { status: "published" } }),
        ]);
        return { posts, total };
      }),
    getBlogPostBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(({ input }) => db.blog.findFirst({ where: { slug: input.slug, status: "published" } })),
    getRelatedBlogPosts: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(({ input }) =>
        db.blog.findMany({
          where: { status: "published", slug: { not: input.slug } },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      ),
  }),
  account: accountRouter,
  admin:  router({ ...crudRouters, emailSettings: emailSettingsRouter }),
});

export type AppRouter = typeof appRouter;
