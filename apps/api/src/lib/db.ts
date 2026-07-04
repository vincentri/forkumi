import { createBaseClient } from "@repo/db";

// App-owned Prisma client. Domain query extensions live here, NOT in @repo/db —
// that package stays generic infra. All app callers import `prisma` from this
// file so they share one extended client (single connection pool + one place
// the restaurant-comment rating rule is applied).

// Recompute restaurant_comments.rating_total as the rounded average of the three
// named 1-5 ratings on every write. Single source of truth so the total stays
// consistent for every caller (admin CRUD, seed, public submit).
// ponytail: only recomputes when all three ratings are present in the write —
// full-object writes from the admin form always carry them. A partial update
// touching one rating without the others leaves the old total; recompute-with-
// read here only if partial rating edits ever become a real path.
function withRatingTotal(data: Record<string, unknown> | undefined) {
  if (!data) return;
  // Normalize empty parentId ("" from the admin text field) to null so top-level
  // rows are consistently null — reply guards use a truthy check either way.
  if (data.parentId === "") data.parentId = null;
  const { ratingMakanan: m, ratingLayanan: l, ratingSuasana: s } = data;
  if (typeof m === "number" && typeof l === "number" && typeof s === "number") {
    data.ratingTotal = Math.round((m + l + s) / 3);
  }
}

function createExtendedClient() {
  return createBaseClient().$extends({
    query: {
      restaurantComment: {
        create({ args, query }) {
          withRatingTotal(args.data as Record<string, unknown>);
          return query(args);
        },
        update({ args, query }) {
          withRatingTotal(args.data as Record<string, unknown>);
          return query(args);
        },
        updateMany({ args, query }) {
          withRatingTotal(args.data as Record<string, unknown>);
          return query(args);
        },
        upsert({ args, query }) {
          withRatingTotal(args.create as Record<string, unknown>);
          withRatingTotal(args.update as Record<string, unknown>);
          return query(args);
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prismaExt: ReturnType<typeof createExtendedClient> | undefined;
};

export const prisma = globalForPrisma.prismaExt ?? createExtendedClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaExt = prisma;

export { PrismaClient } from "@repo/db";
export type { Prisma } from "@repo/db";
