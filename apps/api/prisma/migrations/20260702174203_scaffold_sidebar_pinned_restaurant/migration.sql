-- CreateTable
CREATE TABLE "sidebar_pinned_restaurants" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sidebar_pinned_restaurants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sidebar_pinned_restaurants" ADD CONSTRAINT "sidebar_pinned_restaurants_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
