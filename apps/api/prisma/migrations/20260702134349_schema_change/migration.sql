-- AddForeignKey
ALTER TABLE "restaurant_comments" ADD CONSTRAINT "restaurant_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "restaurant_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
