-- CreateTable
CREATE TABLE "section_cards" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'purple',
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "section_cards_section_locale_position_idx" ON "section_cards"("section", "locale", "position");
