import { defineCRUD } from "@repo/crud";

// Comment moderation resource. Primary UI is the custom threaded admin page
// (/admin/comments). This CRUD config exists to scaffold the Prisma model,
// base tRPC procedures, permissions, and a raw fallback page.
//
// parentId is declared as a plain text field (not optionsFrom) so the scaffold
// emits a clean scalar column. The self-relation (parent/replies) is added to
// schema.prisma manually after scaffolding — the scaffold can't emit named
// self-relations. See plan: Comment System — Admin Side.
export const CommentCRUD = defineCRUD({
  model: "comment",
  label: "Comments",
  icon: "MessageSquare",
  navGroup: "Blog",
  defaultSortField: "createdAt",
  defaultSortDir: "desc",
  fields: [
    {
      name: "blogId",
      type: "select",
      label: "Post",
      required: true,
      optionsFrom: {
        model: "blog",
        valueField: "id",
        labelField: "title",
        orderBy: { title: "asc" },
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
      name: "isAdmin",
      type: "boolean",
      label: "Admin reply",
      default: false,
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
    {
      name: "parentId",
      type: "text",
      label: "Parent comment id",
      showInForm: false,
      filterable: true,
    },
  ],
});
