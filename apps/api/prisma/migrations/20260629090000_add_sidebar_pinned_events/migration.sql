CREATE TABLE "sidebar_pinned_events" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "sidebar_pinned_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sidebar_pinned_events_event_id_key" ON "sidebar_pinned_events"("event_id");
CREATE INDEX "sidebar_pinned_events_position_idx" ON "sidebar_pinned_events"("position");

ALTER TABLE "sidebar_pinned_events"
ADD CONSTRAINT "sidebar_pinned_events_event_id_fkey"
FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
