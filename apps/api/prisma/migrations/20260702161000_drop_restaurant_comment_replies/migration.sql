-- Drop the admin-reply feature from restaurant_comments.
-- ponytail: 1 reply row + 3 admin rows existed; we drop them intentionally.

-- DropForeignKey
ALTER TABLE "restaurant_comments" DROP CONSTRAINT IF EXISTS "restaurant_comments_parent_id_fkey";

-- Delete all rows that depended on the reply/admin columns.
-- (Anything with a parent_id was a reply; all admin-authored rows are now invalid.)
DELETE FROM "restaurant_comments" WHERE "parent_id" IS NOT NULL OR "is_admin" = true;

-- DropIndex (no dedicated index for parent_id, but FK constraint is the implicit one)
-- DropColumn
ALTER TABLE "restaurant_comments" DROP COLUMN IF EXISTS "parent_id";
ALTER TABLE "restaurant_comments" DROP COLUMN IF EXISTS "is_admin";
