-- CreateTable
CREATE TABLE "restaurant_operation_times" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TEXT,
    "close_time" TEXT,

    CONSTRAINT "restaurant_operation_times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_operation_times_restaurant_id_day_of_week_key" ON "restaurant_operation_times"("restaurant_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "restaurant_operation_times" ADD CONSTRAINT "restaurant_operation_times_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
