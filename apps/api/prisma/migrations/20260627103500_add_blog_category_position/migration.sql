-- AlterTable
ALTER TABLE "blog_categories" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- ponytail: backfill alphabetical so initial order matches old title-asc query.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY title ASC) - 1 AS pos FROM "blog_categories"
)
UPDATE "blog_categories" bc SET "position" = o.pos FROM ordered o WHERE bc.id = o.id;
