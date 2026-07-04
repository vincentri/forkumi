import { defineCRUD } from "@repo/crud";

// Restaurant review resource. Flat list — no replies, no threaded comments.
// Reviews carry three 1-5 star ratings (makanan, layanan, suasana) and optional
// picture/video attachments. ratingTotal is a rounded average recomputed on
// every write by a Prisma query extension in @repo/db (packages/db/src/index.ts).
// It is read-only in the admin form (showInForm: false) — admins edit the three
// named ratings; the total is always derived.
export const RestaurantCommentCRUD = defineCRUD({
  model: "restaurantComment",
  label: "Restaurant Comments",
  icon: "MessageSquare",
  navGroup: "Restaurant",
  navGroupIcon: "UtensilsCrossed",
  defaultSortField: "createdAt",
  defaultSortDir: "desc",
  fields: [
    {
      name: "restaurantId",
      type: "select",
      label: "Restaurant",
      required: true,
      optionsFrom: {
        model: "restaurant",
        valueField: "id",
        labelField: "name",
        orderBy: { name: "asc" },
      },
    },
    { name: "authorName", type: "text", label: "Author", required: true },
    {
      name: "content",
      type: "textarea",
      label: "Comment",
      required: true,
      showInTable: false,
    },
    {
      name: "media",
      type: "gallery",
      label: "Foto & Video",
      uploadUrl: "/api/upload?path=uploads/reviews",
      childModelName: "RestaurantCommentMedia",
      maxSizeMB: 50,
      showInTable: false,
    },
    { name: "ratingMakanan", type: "range", label: "Makanan", min: 1, max: 5, step: 1 },
    { name: "ratingLayanan", type: "range", label: "Layanan", min: 1, max: 5, step: 1 },
    { name: "ratingSuasana", type: "range", label: "Suasana", min: 1, max: 5, step: 1 },
    {
      name: "ratingTotal",
      type: "range",
      label: "Total Rating",
      min: 1,
      max: 5,
      showInForm: false,
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      default: "pending",
      filterable: true,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
      ],
    },
  ],
});
