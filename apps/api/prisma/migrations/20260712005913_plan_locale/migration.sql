-- Add locale column to plans. Existing rows default to "en".
ALTER TABLE "plans" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';

-- Replace position-only index with locale+position to support per-locale listing.
DROP INDEX IF EXISTS "plans_position_idx";
CREATE INDEX "plans_locale_position_idx" ON "plans"("locale", "position");
