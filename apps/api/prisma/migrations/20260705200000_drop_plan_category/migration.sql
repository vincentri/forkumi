-- ponytail: drop plan_categories + category_id column. PlanCategory was an
-- unnecessary intermediate table; plans are universal and the grouping wasn't
-- useful in practice. All existing plan_category rows can stay dead since
-- nothing references them after the column drop.
ALTER TABLE "plans" DROP COLUMN "category_id";
DROP TABLE "plan_categories";