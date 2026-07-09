-- CreateTable
CREATE TABLE "plan_of_interest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_of_interest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_of_interest_locale_position_idx" ON "plan_of_interest"("locale", "position");
