-- DropColumn
ALTER TABLE "restaurant_comments" DROP COLUMN IF EXISTS "picture";
ALTER TABLE "restaurant_comments" DROP COLUMN IF EXISTS "video";

-- CreateTable
CREATE TABLE "_restaurant_comments_medias" (
    "id" TEXT NOT NULL,
    "restaurant_comment_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_restaurant_comments_medias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_restaurant_comments_medias_restaurant_comment_id_position_key" ON "_restaurant_comments_medias"("restaurant_comment_id", "position");

-- AddForeignKey
ALTER TABLE "_restaurant_comments_medias" ADD CONSTRAINT "_restaurant_comments_medias_restaurant_comment_id_fkey" FOREIGN KEY ("restaurant_comment_id") REFERENCES "restaurant_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
