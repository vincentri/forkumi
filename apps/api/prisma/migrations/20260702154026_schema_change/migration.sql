-- CreateTable
CREATE TABLE "restaurant_images" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "restaurant_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_images_restaurant_id_position_key" ON "restaurant_images"("restaurant_id", "position");

-- AddForeignKey
ALTER TABLE "restaurant_images" ADD CONSTRAINT "restaurant_images_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
