import { prisma } from "~/lib/db";
import { router, permissionProcedure } from "../trpc";
import { z } from "@repo/crud";

/**
 * Restaurant reviews are a flat list — no replies, no threaded structure.
 * Just query, search, and approve.
 */
export const restaurantCommentRouter = router({
  listThreaded: permissionProcedure("view", "restaurantComment")
    .input(
      z
        .object({
          restaurantId: z.string().optional(),
          status: z.enum(["pending", "approved"]).optional(),
          page: z.number().min(1).default(1),
          perPage: z.number().min(1).max(50).default(20),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const perPage = input?.perPage ?? 20;
      const where = {
        ...(input?.restaurantId ? { restaurantId: input.restaurantId } : {}),
        ...(input?.status ? { status: input.status } : {}),
      };
      const [items, total] = await Promise.all([
        prisma.restaurantComment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            restaurant: { select: { id: true, name: true, slug: true } },
            media: { orderBy: { position: "asc" }, select: { url: true } },
          },
        }),
        prisma.restaurantComment.count({ where }),
      ]);
      return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
    }),

  /** Searchable restaurant picker — drives the restaurant filter combobox. */
  searchRestaurants: permissionProcedure("view", "restaurantComment")
    .input(
      z.object({
        search: z.string().trim().optional(),
        selected: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const take = 50;
      const [matches, selected] = await Promise.all([
        prisma.restaurant.findMany({
          where: input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { slug: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {},
          select: { id: true, name: true },
          orderBy: { name: "asc" },
          take,
        }),
        input.selected
          ? prisma.restaurant.findUnique({
              where: { id: input.selected },
              select: { id: true, name: true },
            })
          : null,
      ]);
      const options = matches.map((r) => ({ value: r.id, label: r.name }));
      // Keep the currently-selected restaurant present so its label always shows,
      // even when it wouldn't match the search term.
      if (selected && !options.some((o) => o.value === selected.id)) {
        options.unshift({ value: selected.id, label: selected.name });
      }
      return options;
    }),

  approve: permissionProcedure("update", "restaurantComment")
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) =>
      prisma.restaurantComment.update({
        where: { id: input.id },
        data: { status: "approved" },
      }),
    ),
});