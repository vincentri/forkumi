-- AlterTable
ALTER TABLE "events" ALTER COLUMN "date" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_category_id_fkey" FOREIGN KEY ("event_category_id") REFERENCES "event_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
