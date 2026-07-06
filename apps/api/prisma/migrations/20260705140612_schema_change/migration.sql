-- CreateTable
CREATE TABLE "whysub_cards" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'team',
    "color" TEXT NOT NULL DEFAULT 'purple',
    "heading" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whysub_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compare_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_criteria" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cells" TEXT NOT NULL DEFAULT 'y,n,l',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compare_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whysub_cards_locale_position_idx" ON "whysub_cards"("locale", "position");

-- CreateIndex
CREATE INDEX "compare_categories_locale_position_idx" ON "compare_categories"("locale", "position");

-- CreateIndex
CREATE INDEX "compare_criteria_locale_position_idx" ON "compare_criteria"("locale", "position");
