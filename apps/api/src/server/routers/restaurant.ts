import { prisma } from "~/lib/db";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { z } from "@repo/crud";

// ponytail: Prisma 7 client doesn't expose full relation types in TS without an explicit payload;
// cast `operationTimes` reads to the raw shape.
const includeOperationTimes = {
  operationTimes: {
    orderBy: { dayOfWeek: "asc" as const },
  },
} as const;

// Aggregate rating (avg ratingTotal) + review count from approved top-level comments.
async function aggregateRatings(
  ids: string[],
): Promise<Map<string, { avgRating: number | null; reviewCount: number }>> {
  const ratings =
    ids.length > 0
      ? await prisma.restaurantComment.groupBy({
          by: ["restaurantId"],
          where: {
            restaurantId: { in: ids },
            status: "approved",
            ratingTotal: { not: null },
          },
          _avg: { ratingTotal: true },
          _count: { _all: true },
        })
      : [];
  return new Map(
    ratings.map((r) => [
      r.restaurantId,
      {
        avgRating: r._avg.ratingTotal != null ? Math.round(r._avg.ratingTotal * 10) / 10 : null,
        reviewCount: r._count._all,
      },
    ]),
  );
}

export const restaurantPublicRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          perPage: z.number().min(1).max(24).default(12),
          search: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const perPage = input?.perPage ?? 12;
      const where = input?.search
        ? { name: { contains: input.search, mode: "insensitive" as const } }
        : {};
      const [items, total] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prisma.restaurant.findMany({
          where,
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: "desc" },
          include: includeOperationTimes as any,
        }),
        prisma.restaurant.count({ where }),
      ]);

      const ids = (items as any[]).map((r) => r.id);
      const ratingByRestaurant = await aggregateRatings(ids);

      return {
        items: (items as any[]).map(({ operationTimes, ...rest }) => ({
          ...rest,
          operationTimes,
          avgRating: ratingByRestaurant.get(rest.id)?.avgRating ?? null,
          reviewCount: ratingByRestaurant.get(rest.id)?.reviewCount ?? 0,
        })),
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      };
    }),

  autocomplete: publicProcedure
    .input(z.object({ q: z.string().trim().min(1) }))
    .query(async ({ input }) => {
      const items = await prisma.restaurant.findMany({
        where: {
          OR: [
            { name: { contains: input.q, mode: "insensitive" } },
            { slug: { contains: input.q, mode: "insensitive" } },
          ],
        },
        take: 15,
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, location: true },
      });
      return items;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = (await prisma.restaurant.findFirst({
        where: { slug: input.slug },
        include: {
          ...includeOperationTimes,
          images: {
            orderBy: { position: "asc" as const },
            select: { url: true, alt: true, position: true },
          },
        } as any,
      })) as any;
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      const { operationTimes, images, ...rest } = item;
      return { ...rest, operationTimes, images: images ?? [] };
    }),

  // Admin-pinned restaurants for the homepage sidebar slider (cari-resto card shape).
  pinned: publicProcedure.query(async () => {
    const pins = await prisma.sidebarPinnedRestaurant.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    if (pins.length === 0) return [];

    const ids = pins.map((p) => p.restaurantId);
    const restaurants = await prisma.restaurant.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        thumbnail: true,
        priceStart: true,
        priceEnd: true,
      },
    });
    const byId = new Map(restaurants.map((r) => [r.id, r]));
    const ratingByRestaurant = await aggregateRatings(ids);

    // Preserve pin order.
    return pins
      .map((p) => byId.get(p.restaurantId))
      .filter((r): r is (typeof restaurants)[number] => Boolean(r))
      .map((r) => ({
        ...r,
        avgRating: ratingByRestaurant.get(r.id)?.avgRating ?? null,
        reviewCount: ratingByRestaurant.get(r.id)?.reviewCount ?? 0,
      }));
  }),
});