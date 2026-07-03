"use client";

import { Input, Label, Switch, cn } from "@repo/ui";

export interface ScheduleItem {
  dayOfWeek: number;
  openTime?: string | null;
  closeTime?: string | null;
}

export interface ScheduleEditorProps {
  value: ScheduleItem[];
  onChange: (value: ScheduleItem[]) => void;
  error?: string;
  dayLabels?: string[];
  /** Defaults applied when toggling a closed day open. Defaults to "08:00" / "22:00". */
  defaultOpenTime?: string;
  defaultCloseTime?: string;
  /** Disable all inputs. */
  disabled?: boolean;
}

const DEFAULT_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_OPEN = "08:00";
const DEFAULT_CLOSE = "22:00";

function normalizeRow(
  day: number,
  prev: ScheduleItem | undefined,
  patch?: Partial<ScheduleItem>,
): ScheduleItem {
  const base: ScheduleItem = prev ?? { dayOfWeek: day, openTime: "", closeTime: "" };
  return {
    ...base,
    dayOfWeek: day,
    openTime: base.openTime ?? "",
    closeTime: base.closeTime ?? "",
    ...patch,
  };
}

export function ScheduleEditor({
  value,
  onChange,
  error,
  dayLabels = DEFAULT_DAY_LABELS,
  defaultOpenTime = DEFAULT_OPEN,
  defaultCloseTime = DEFAULT_CLOSE,
  disabled,
}: ScheduleEditorProps) {
  const byDay = new Map<number, ScheduleItem>();
  for (const item of value ?? []) byDay.set(item.dayOfWeek, item);

  const setRow = (day: number, patch: Partial<ScheduleItem>) => {
    const next = normalizeRow(day, byDay.get(day), patch);
    const merged = new Map(byDay);
    merged.set(day, next);
    onChange([...merged.values()].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
  };

  const toggleClosed = (day: number, closed: boolean) => {
    if (closed) {
      setRow(day, { openTime: "", closeTime: "" });
    } else {
      setRow(day, { openTime: defaultOpenTime, closeTime: defaultCloseTime });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Operation Hours</p>
        <p className="text-xs text-muted-foreground">
          Times are stored as HH:mm (24-hour). Use the switch to mark a day as closed.
        </p>
      </div>

      <div className="rounded-md border border-border">
        <div className="grid grid-cols-[1fr_1fr_1fr_140px] items-center gap-2 border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Day</span>
          <span>Open</span>
          <span>Close</span>
          <span className="text-right">Status</span>
        </div>
        {dayLabels.map((label, day) => {
          const row = byDay.get(day);
          const isClosed = !row || (!row.openTime && !row.closeTime);
          const open = row?.openTime ?? "";
          const close = row?.closeTime ?? "";
          return (
            <div
              key={day}
              className="grid grid-cols-[1fr_1fr_1fr_140px] items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
            >
              <Label className="text-sm font-medium">{label}</Label>
              <Input
                type="time"
                value={open ?? ""}
                onChange={(event) => setRow(day, { openTime: event.target.value })}
                className={cn(error && !isClosed ? "border-destructive" : undefined)}
                disabled={disabled || isClosed}
              />
              <Input
                type="time"
                value={close ?? ""}
                onChange={(event) => setRow(day, { closeTime: event.target.value })}
                className={cn(error && !isClosed ? "border-destructive" : undefined)}
                disabled={disabled || isClosed}
              />
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">
                  {isClosed ? "Closed" : "Open"}
                </span>
                <Switch
                  checked={!isClosed}
                  onCheckedChange={(checked) => toggleClosed(day, !checked)}
                  aria-label={`Toggle ${label}`}
                  disabled={disabled}
                />
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}