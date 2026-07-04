-- AlterTable
ALTER TABLE "restaurant_comments" ADD COLUMN     "is_admin" BOOLEAN DEFAULT false,
ADD COLUMN     "parent_id" TEXT,
ALTER COLUMN "rating_makanan" DROP NOT NULL,
ALTER COLUMN "rating_layanan" DROP NOT NULL,
ALTER COLUMN "rating_suasana" DROP NOT NULL;
