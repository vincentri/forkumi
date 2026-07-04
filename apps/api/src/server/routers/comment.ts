import { prisma } from "~/lib/db";
import { TRPCError } from "@trpc/server";
import { router, permissionProcedure } from "../trpc";
import { z } from "@repo/crud";
import { buildThreadedComments } from "~/lib/thread-comments";

const CONTENT_MAX = 5000;

/**
 * Comments are a 2-layer tree: top-level comments (parentId = null) and their
 * direct replies (parentId = top-level id). No 3rd layer is allowed — every
 * mutation that sets a parentId verifies the parent is itself top-level.
 */
export const commentRouter = router({
  listThreaded: permissionProcedure("view", "comment")
    .input(
      z
        .object({
          blogId: z.string().optional(),
          status: z.enum(["pending", "approved"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const comments = await prisma.comment.findMany({
        where: {
          ...(input?.blogId ? { blogId: input.blogId } : {}),
          ...(input?.status ? { status: input.status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: { blog: { select: { id: true, title: true, slug: true } } },
      });

      return buildThreadedComments(comments);
    }),

  /** Searchable blog picker — drives the blog filter combobox on the comments page. */
  searchBlogs: permissionProcedure("view", "comment")
    .input(
      z.object({
        search: z.string().trim().optional(),
        selected: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const take = 50;
      const [matches, selected] = await Promise.all([
        prisma.blog.findMany({
          where: input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  { slug: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {},
          select: { id: true, title: true },
          orderBy: { title: "asc" },
          take,
        }),
        input.selected
          ? prisma.blog.findUnique({
              where: { id: input.selected },
              select: { id: true, title: true },
            })
          : null,
      ]);
      const options = matches.map((b) => ({ value: b.id, label: b.title }));
      // Ensure the currently-selected blog is always present (so its label shows)
      // even when it wouldn't match the search term.
      if (selected && !options.some((o) => o.value === selected.id)) {
        options.unshift({ value: selected.id, label: selected.title });
      }
      return options;
    }),

  reply: permissionProcedure("create", "comment")
    .input(
      z.object({
        parentId: z.string().min(1),
        content: z.string().trim().min(1).max(CONTENT_MAX),
      }),
    )
    .mutation(async ({ input }) => {
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
      return prisma.comment.create({
        data: {
          blogId: parent.blogId,
          parentId: parent.id,
          authorName: "Jajanpedia",
          content: input.content,
          isAdmin: true,
          status: "approved", // admin replies are published immediately
        },
      });
    }),

  approve: permissionProcedure("update", "comment")
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) =>
      prisma.comment.update({
        where: { id: input.id },
        data: { status: "approved" },
      }),
    ),
});
