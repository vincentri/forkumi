-- CreateTable
CREATE TABLE "process_phases" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_phases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "process_phases_locale_position_idx" ON "process_phases"("locale", "position");
