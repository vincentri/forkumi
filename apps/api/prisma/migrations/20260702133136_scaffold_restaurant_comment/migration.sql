-- CreateTable
CREATE TABLE "restaurant_comments" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "picture" TEXT,
    "video" TEXT,
    "rating_makanan" INTEGER NOT NULL,
    "rating_layanan" INTEGER NOT NULL,
    "rating_suasana" INTEGER NOT NULL,
    "rating_total" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "restaurant_comments" ADD CONSTRAINT "restaurant_comments_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
