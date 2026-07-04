import { prisma } from "~/lib/db";
import { buildCRUDRouters, z } from "@repo/crud";
import type { PrismaLikeClient } from "@repo/crud";
import { router, publicProcedure, permissionProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import * as CRUDConfigs from "~/crud";
import { userRouter } from "./routers/user";
import { roleRouter } from "./routers/role";
import { commentRouter } from "./routers/comment";
import { restaurantCommentRouter } from "./routers/restaurantComment";
import { restaurantPublicRouter } from "./routers/restaurant";
import { getInvitationProcedure, acceptInvitationProcedure } from "./routers/invitation";
import { accountRouter } from "./routers/account";
import { emailSettingsRouter } from "./routers/emailSettings";
import { FrontPageSettingsCRUD } from "~/crud/frontPageSetting";
import { deleteManagedAsset } from "~/lib/delete-managed-asset";
import { buildThreadedComments } from "~/lib/thread-comments";
import { isBotSubmission } from "./bot-guard";

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
  blogCategoryId: string | null;
  publishedAt: Date | null;
  blogCategory: { id: string; slug: string; title: string } | null;
  blogTags: Array<{ tag: { id: string; name: string } }>;
};
type BlogCategoryRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  position: number;
};
type EventCategoryRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
};
type TagRow = {
  id: string;
  name: string;
  status: string;
};
type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  location: string;
  content: string;
  date: string;
  time: string;
  status: string;
  publishedAt: Date | null;
  eventCategoryId: string | null;
  eventCategory: { id: string; slug: string; title: string } | null;
  organizedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};
type SliderRow = { id: string; blog_id: string };
type ContactTopicRow = { id: string; name: string; status: string };
type ContactSubmissionInput = {
  name: string;
  email: string;
  topic: string;
  message: string;
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
    where: Record<string, unknown>;
    orderBy?: { createdAt: "asc" | "desc" };
    skip?: number;
    take?: number;
    include?: Record<string, unknown>;
  }) => Promise<BlogRow[]>;
  findFirst: (args: {
    where: { slug?: string; id?: string; status: string };
    include?: Record<string, unknown>;
  }) => Promise<BlogRow | null>;
  count: (args: { where: { status: string } }) => Promise<number>;
};
type BlogCategoryDelegate = {
  findMany: (args: { where: { status: string }; orderBy: Array<{ position: "asc" | "desc" } | { title: "asc" | "desc" }> }) => Promise<BlogCategoryRow[]>;
};
type EventCategoryDelegate = {
  findMany: (args: { where: { status: string }; orderBy: { title: "asc" | "desc" } }) => Promise<EventCategoryRow[]>;
};
type TagDelegate = {
  findMany: (args: { where: { status: string }; orderBy: { name: "asc" | "desc" } }) => Promise<TagRow[]>;
};
type EventDelegate = {
  findMany: (args: {
    where: {
      id?: string | { in: string[] };
      status: string;
      slug?: { not: string };
      eventCategoryId?: string;
      publishedAt?: { lte: Date };
    };
    orderBy: { createdAt: "asc" | "desc" };
    skip?: number;
    take?: number;
    include?: Record<string, unknown>;
  }) => Promise<EventRow[]>;
  findFirst: (args: {
    where: { slug?: string; id?: string; status: string; publishedAt?: { lte: Date } };
    include?: Record<string, unknown>;
  }) => Promise<EventRow | null>;
  count: (args: { where: { status: string; eventCategoryId?: string; publishedAt?: { lte: Date } } }) => Promise<number>;
};
type SliderDelegate = {
  findMany: (args: { orderBy: { createdAt: "asc" | "desc" } }) => Promise<SliderRow[]>;
};
type SidebarPinnedEventRow = { eventId: string; position: number; createdAt: Date };
type SidebarPinnedEventDelegate = {
  findMany: (args: {
    orderBy: Array<{ position: "asc" | "desc" } | { createdAt: "asc" | "desc" }>;
  }) => Promise<SidebarPinnedEventRow[]>;
};
type ContactTopicDelegate = {
  findMany: (args: { where: { status: string }; orderBy: { name: "asc" | "desc" } }) => Promise<ContactTopicRow[]>;
};

const db = prisma as unknown as {
  frontPageSettings: FrontPageSettingsDelegate;
  page: PageDelegate;
  blog: BlogDelegate;
  blogCategory: BlogCategoryDelegate;
  eventCategory: EventCategoryDelegate;
  tag: TagDelegate;
  event: EventDelegate;
  slider: SliderDelegate;
  sidebarPinnedEvent: SidebarPinnedEventDelegate;
  contactTopic: ContactTopicDelegate;
  contact: { create: (args: { data: ContactSubmissionInput }) => Promise<{ id: string }> };
};

const blogInclude = {
  blogCategory: { select: { id: true, slug: true, title: true } },
  blogTags: { include: { tag: { select: { id: true, name: true } } } },
} as const;

const eventInclude = {
  eventCategory: { select: { id: true, slug: true, title: true } },
} as const;

function keysForNamespace(namespace: string): string[] {
  return FrontPageSettingsCRUD.fields
    .filter((f) => f.namespace === namespace)
    .map((f) => f.name);
}

const procedureMapFactory = (config: import("@repo/crud").CRUDConfig) => ({
  list:    permissionProcedure("view",   config.model),
  getById: permissionProcedure("view",   config.model),
  create:  permissionProcedure("create", config.model),
  update:  permissionProcedure("update", config.model),
  delete:  permissionProcedure("delete", config.model),
});

const crudRouters = buildCRUDRouters(
  CRUDConfigs as Record<string, import("@repo/crud").CRUDConfig>,
  router,
  procedureMapFactory,
  prisma as unknown as PrismaLikeClient,
  {
    onAssetReplaced: ({ oldValue }) => deleteManagedAsset(oldValue),
  },
);

crudRouters.user = userRouter;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const autoRole = crudRouters.role as any;
crudRouters.role = router({
  list:       autoRole.list,
  getById:    autoRole.getById,
  bulkDelete: autoRole.bulkDelete,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (roleRouter as any).create,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (roleRouter as any).update,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (roleRouter as any).delete,
});

// Comments: keep all auto CRUD procedures, layer on threaded list + reply/approve.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const autoComment = crudRouters.comment as any;
crudRouters.comment = router({
  list:       autoComment.list,
  getById:    autoComment.getById,
  create:     autoComment.create,
  update:     autoComment.update,
  delete:     autoComment.delete,
  bulkDelete: autoComment.bulkDelete,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listThreaded: (commentRouter as any).listThreaded,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchBlogs:  (commentRouter as any).searchBlogs,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reply:        (commentRouter as any).reply,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  approve:      (commentRouter as any).approve,
});

// Restaurant comments: auto CRUD + listThreaded/approve (no reply).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const autoRestaurantComment = crudRouters.restaurantComment as any;
crudRouters.restaurantComment = router({
  list:       autoRestaurantComment.list,
  getById:    autoRestaurantComment.getById,
  create:     autoRestaurantComment.create,
  update:     autoRestaurantComment.update,
  delete:     autoRestaurantComment.delete,
  bulkDelete: autoRestaurantComment.bulkDelete,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listThreaded:      (restaurantCommentRouter as any).listThreaded,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchRestaurants: (restaurantCommentRouter as any).searchRestaurants,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  approve:           (restaurantCommentRouter as any).approve,
});

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  public: router({
    restaurant: restaurantPublicRouter,
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
    subscribeNewsletter: publicProcedure
      .input(z.object({ email: z.string().trim().email("Enter a valid email address.") }))
      .mutation(async ({ input }) => {
        const email = input.email.toLowerCase();
        try {
          await prisma.newsletterSubscriber.create({ data: { email } });
          return { ok: true };
        } catch (err) {
          if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This email is already subscribed.",
            });
          }
          throw err;
        }
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
        include: blogInclude,
      }),
    ),
    getBlogPostsPaginated: publicProcedure
      .input(
        z.object({
          page: z.number().min(1),
          perPage: z.number().min(1).max(24),
          categoryId: z.string().optional(),
          tagId: z.string().optional(),
        }),
      )
      .query(async ({ input }) => {
        const where: Prisma.BlogWhereInput = { status: "published" };
        if (input.categoryId) where.blogCategoryId = input.categoryId;
        if (input.tagId) where.blogTags = { some: { tagId: input.tagId } };
        const [posts, total] = await Promise.all([
          db.blog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (input.page - 1) * input.perPage,
            take: input.perPage,
            include: blogInclude,
          }),
          db.blog.count({ where: where as never }),
        ]);
        return { posts, total };
      }),
    searchBlogs: publicProcedure
      .input(z.object({ q: z.string().min(1) }))
      .query(({ input }) =>
        db.blog.findMany({
          where: {
            status: "published",
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { description: { contains: input.q, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: blogInclude,
        }),
      ),
    getBlogPostBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(({ input }) =>
        db.blog.findFirst({ where: { slug: input.slug, status: "published" }, include: blogInclude }),
      ),
    getBlogById: publicProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(({ input }) =>
        db.blog.findFirst({ where: { id: input.id, status: "published" }, include: blogInclude }),
      ),
    getRelatedBlogPosts: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(async ({ input }) => {
        const current = await db.blog.findFirst({
          where: { slug: input.slug, status: "published" },
          include: blogInclude,
        });
        const byCategoryIds = current?.blogCategoryId
          ? (
              await prisma.$queryRaw<{ id: string }[]>(
                Prisma.sql`SELECT id FROM "blogs" WHERE status = 'published' AND id <> ${current.id} AND "blog_category_id" = ${current.blogCategoryId} ORDER BY RANDOM() LIMIT 3`,
              )
            ).map((r) => r.id)
          : [];
        const excludeIds = [current?.id, ...byCategoryIds].filter((x): x is string => Boolean(x));
        const need = 3 - byCategoryIds.length;
        const fallbackIds =
          need > 0
            ? (
                await prisma.$queryRaw<{ id: string }[]>(
                  Prisma.sql`SELECT id FROM "blogs" WHERE status = 'published' AND id NOT IN (${Prisma.join(excludeIds)}) ORDER BY RANDOM() LIMIT ${need}`,
                )
              ).map((r) => r.id)
            : [];
        const orderedIds = [...byCategoryIds, ...fallbackIds];
        if (orderedIds.length === 0) return [];
        const posts = await db.blog.findMany({
          where: { id: { in: orderedIds } },
          include: blogInclude,
        });
        const order = new Map(orderedIds.map((id, i) => [id, i]));
        return posts.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      }),
    getBlogCategories: publicProcedure.query(() =>
      db.blogCategory.findMany({
        where: { status: "published" },
        orderBy: [{ position: "asc" }, { title: "asc" }],
      }),
    ),
    getTags: publicProcedure.query(() =>
      db.tag.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    ),
    getSliders: publicProcedure.query(async () => {
      const sliders = await db.slider.findMany({ orderBy: { createdAt: "asc" } });
      if (sliders.length === 0) return [];
      const blogs = await db.blog.findMany({
        where: { id: { in: sliders.map((s) => s.blog_id) }, status: "published" },
        include: blogInclude,
      });
      const blogMap = new Map(blogs.map((b) => [b.id, b]));
      return sliders
        .map((s) => blogMap.get(s.blog_id))
        .filter((b): b is BlogRow => Boolean(b));
    }),
    getSidebarPinnedEvents: publicProcedure.query(async () => {
      const pinned = await db.sidebarPinnedEvent.findMany({
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      });
      if (pinned.length === 0) return [];

      const events = await db.event.findMany({
        where: {
          status: "published",
          publishedAt: { lte: new Date() },
        },
        orderBy: { createdAt: "desc" },
        include: eventInclude,
      });
      const eventMap = new Map(events.map((event) => [event.id, event]));
      return pinned
        .map((item) => eventMap.get(item.eventId))
        .filter((event): event is EventRow => Boolean(event));
    }),
    getEvents: publicProcedure
      .input(z.object({ categoryId: z.string().optional() }).optional())
      .query(({ input }) =>
        db.event.findMany({
          where: {
            status: "published",
            publishedAt: { lte: new Date() },
            ...(input?.categoryId ? { eventCategoryId: input.categoryId } : {}),
          },
          orderBy: { createdAt: "desc" },
          include: eventInclude,
        }),
      ),
    getEventsPaginated: publicProcedure
      .input(
        z.object({
          page: z.number().min(1),
          perPage: z.number().min(1).max(24),
          categoryId: z.string().optional(),
        }),
      )
      .query(async ({ input }) => {
        const where = {
          status: "published",
          publishedAt: { lte: new Date() },
          ...(input.categoryId ? { eventCategoryId: input.categoryId } : {}),
        };
        const [events, total] = await Promise.all([
          db.event.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (input.page - 1) * input.perPage,
            take: input.perPage,
            include: eventInclude,
          }),
          db.event.count({ where }),
        ]);
        return { events, total };
      }),
    getEventBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(({ input }) =>
        db.event.findFirst({
          where: { slug: input.slug, status: "published", publishedAt: { lte: new Date() } },
          include: eventInclude,
        }),
      ),
    getEventById: publicProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(({ input }) =>
        db.event.findFirst({
          where: {
            id: input.id,
            status: "published",
            publishedAt: { lte: new Date() },
          },
          include: eventInclude,
        }),
      ),
    getEventCategories: publicProcedure.query(() =>
      db.eventCategory.findMany({ where: { status: "published" }, orderBy: { title: "asc" } }),
    ),
    getRelatedEvents: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(({ input }) =>
        db.event.findMany({
          where: { status: "published", publishedAt: { lte: new Date() }, slug: { not: input.slug } },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: eventInclude,
        }),
      ),
    getContactTopics: publicProcedure.query(() =>
      db.contactTopic.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    ),
    submitContact: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(1, "Nama wajib diisi.").max(100),
          email: z.string().trim().email("Email tidak valid."),
          topic: z.string().trim().min(1, "Topik wajib dipilih.").max(100),
          message: z.string().trim().min(10, "Pesan minimal 10 karakter.").max(5000),
          website: z.string().max(5000).optional(),
          _t: z.number().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        if (isBotSubmission(input)) return { ok: true };

        await db.contact.create({
          data: {
            name: input.name,
            email: input.email.toLowerCase(),
            topic: input.topic,
            message: input.message,
          },
        });
        return { ok: true };
      }),
    getThreadedComments: publicProcedure
      .input(z.object({ blogId: z.string().min(1) }))
      .query(async ({ input }) => {
        const comments = await prisma.comment.findMany({
          where: { blogId: input.blogId, status: "approved" },
          orderBy: { createdAt: "desc" },
        });
        return buildThreadedComments(comments);
      }),
    submitComment: publicProcedure
      .input(
        z.object({
          blogId: z.string().min(1),
          authorName: z.string().trim().min(1, "Name is required.").max(100),
          content: z.string().trim().min(1, "Comment is required.").max(5000),
          parentId: z.string().nullable().optional(),
          website: z.string().max(5000).optional(),
          _t: z.number().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        if (isBotSubmission(input)) return { ok: true };

        // 2-layer guard: a reply's parent must be a top-level approved comment.
        if (input.parentId) {
          const parent = await prisma.comment.findUnique({ where: { id: input.parentId } });
          if (!parent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Parent comment not found." });
          }
          if (parent.parentId !== null) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Replies are limited to one level under a top-level comment.",
            });
          }
          if (parent.status !== "approved") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "You can only reply to approved comments.",
            });
          }
        }
        await prisma.comment.create({
          data: {
            blogId: input.blogId,
            authorName: input.authorName,
            content: input.content,
            parentId: input.parentId ?? null,
            status: "pending",
            isAdmin: false,
          },
        });
        return { ok: true };
      }),
    getRestaurantComments: publicProcedure
      .input(
        z.object({
          restaurantId: z.string().min(1),
          page: z.number().min(1).default(1),
          perPage: z.number().min(1).max(50).default(10),
        }),
      )
      .query(async ({ input }) => {
        const { page, perPage } = input;
        const where = { restaurantId: input.restaurantId, status: "approved" };
        const [items, total, agg] = await Promise.all([
          prisma.restaurantComment.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
            include: { media: { orderBy: { position: "asc" }, select: { url: true } } },
          }),
          prisma.restaurantComment.count({ where }),
          prisma.restaurantComment.aggregate({
            where: { ...where, ratingTotal: { not: null } },
            _avg: { ratingTotal: true },
            _count: { _all: true },
          }),
        ]);
        return {
          items,
          total,
          page,
          perPage,
          totalPages: Math.ceil(total / perPage),
          avgRating: agg._avg.ratingTotal != null ? Math.round(agg._avg.ratingTotal * 10) / 10 : 0,
          reviewCount: agg._count._all,
        };
      }),
    submitRestaurantComment: publicProcedure
      .input(
        z
          .object({
            restaurantId: z.string().min(1),
            authorName: z
              .string()
              .trim()
              .min(1, "Name is required.")
              .max(100),
            content: z
              .string()
              .trim()
              .min(1, "Comment is required.")
              .max(5000),
            ratingMakanan: z.number().int().min(1).max(5),
            ratingLayanan: z.number().int().min(1).max(5),
            ratingSuasana: z.number().int().min(1).max(5),
            media: z.array(z.string().min(1)).max(20).optional(),
            website: z.string().max(5000).optional(),
            _t: z.number().optional(),
          }),
      )
      .mutation(async ({ input }) => {
        if (isBotSubmission(input)) return { ok: true };

        // ratingTotal is filled by the ~/lib/db $extends hook on create.
        await prisma.restaurantComment.create({
          data: {
            restaurantId: input.restaurantId,
            authorName: input.authorName,
            content: input.content,
            ratingMakanan: input.ratingMakanan,
            ratingLayanan: input.ratingLayanan,
            ratingSuasana: input.ratingSuasana,
            status: "pending",
            media:
              input.media && input.media.length > 0
                ? { create: input.media.map((url, i) => ({ url, position: i })) }
                : undefined,
          },
        });
        return { ok: true };
      }),
  }),
  account: accountRouter,
  admin:  router({ ...crudRouters, emailSettings: emailSettingsRouter }),
});

export type AppRouter = typeof appRouter;
