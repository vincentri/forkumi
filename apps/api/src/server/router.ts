import { prisma } from "@repo/db";
import { buildCRUDRouters, z } from "@repo/crud";
import { router, publicProcedure, protectedProcedure, permissionProcedure } from "./trpc";
import * as CRUDConfigs from "~/crud";
import { userRouter } from "./routers/user";
import { roleCreateProcedure, roleUpdateProcedure, roleDeleteProcedure } from "./routers/role";
import { getInvitationProcedure, acceptInvitationProcedure } from "./routers/invitation";
import { StaticSectionCRUD } from "~/crud/staticSection";

function keysForNamespace(namespace: string): string[] {
  return StaticSectionCRUD.fields
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
  me:     protectedProcedure.query(({ ctx }) => ctx.session.user),
  public: router({
    getInvitation:    getInvitationProcedure,
    acceptInvitation: acceptInvitationProcedure,
    getContent: publicProcedure
      .input(z.object({ namespace: z.string() }))
      .query(async ({ input }) => {
        const keys = keysForNamespace(input.namespace);
        const rows = await prisma.staticSection.findMany({
          where: {
            OR: [
              { namespace: input.namespace },
              ...(keys.length > 0 ? [{ namespace: null, key: { in: keys } }] : []),
            ],
          },
        });
        return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
      }),
    getLocations: publicProcedure.query(() =>
      prisma.location.findMany({ orderBy: { position: "asc" } }),
    ),
    getSliders: publicProcedure.query(() =>
      prisma.slider.findMany({ orderBy: { position: "asc" } }),
    ),
    getGalleries: publicProcedure.query(() =>
      prisma.gallery.findMany({ orderBy: { position: "asc" } }),
    ),
    getBlogPosts: publicProcedure.query(() =>
      prisma.blog.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }),
    ),
    getBlogPostsPaginated: publicProcedure
      .input(z.object({ page: z.number().int().min(1), perPage: z.number().int().min(1) }))
      .query(async ({ input: { page, perPage } }) => {
        const [posts, total] = await Promise.all([
          prisma.blog.findMany({
            where: { status: "published" },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
          }),
          prisma.blog.count({ where: { status: "published" } }),
        ]);
        return { posts, total };
      }),
    getBlogPostBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) =>
        prisma.blog.findFirst({ where: { slug: input.slug } }),
      ),
    getRelatedBlogPosts: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) =>
        prisma.blog.findMany({
          where: { status: "published", NOT: { slug: input.slug } },
          take: 4,
          orderBy: { createdAt: "desc" },
        }),
      ),
  }),
  admin:  router({ ...crudRouters }),
});

export type AppRouter = typeof appRouter;
