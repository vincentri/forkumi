-- CreateTable
CREATE TABLE "marquee_items" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marquee_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marquee_items_locale_position_idx" ON "marquee_items"("locale", "position");
