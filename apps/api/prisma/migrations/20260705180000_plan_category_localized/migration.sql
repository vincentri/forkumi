-- ponytail: rename + restructure PlanCategory to universal row with two localized name fields.
-- The previous model was per-locale (one row per language), which broke the
-- Plan -> PlanCategory FK (plans referenced the en row only; the id row never
-- matched). Universal row + name_id/name_en is the same pattern Portfolio uses
-- for blurbId/blurbEn. All existing rows have already been wiped.
ALTER TABLE "plan_categories" DROP COLUMN "name";
ALTER TABLE "plan_categories" DROP COLUMN "locale";
ALTER TABLE "plan_categories" ADD COLUMN "key" TEXT NOT NULL;
ALTER TABLE "plan_categories" ADD COLUMN "name_id" TEXT NOT NULL;
ALTER TABLE "plan_categories" ADD COLUMN "name_en" TEXT NOT NULL;
DROP INDEX IF EXISTS "plan_categories_locale_position_idx";
CREATE INDEX "plan_categories_position_idx" ON "plan_categories"("position");
CREATE UNIQUE INDEX "plan_categories_key_key" ON "plan_categories"("key");