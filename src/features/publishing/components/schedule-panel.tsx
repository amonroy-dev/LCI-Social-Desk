"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronDown,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ComposerAction, ComposerState } from "../state";
import { CollapsiblePanel } from "./collapsible-panel";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [
  "00", "05", "10", "15", "20", "25",
  "30", "35", "40", "45", "50", "55",
];
const OPTIMAL_TIMES = [
  { label: "9:00 AM", h: 9, m: "00", p: "AM" as const },
  { label: "12:00 PM", h: 12, m: "00", p: "PM" as const },
  { label: "3:00 PM", h: 3, m: "00", p: "PM" as const },
  { label: "6:00 PM", h: 6, m: "00", p: "PM" as const },
];

function parseTime(time: string | null): {
  hour: number;
  minute: string;
  period: "AM" | "PM";
} {
  if (!time) return { hour: 9, minute: "00", period: "AM" };
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  const mRaw = parseInt(mStr ?? "0", 10);
  const mRounded = Math.round(mRaw / 5) * 5;
  const minuteKey = String(mRounded % 60).padStart(2, "0");
  const minute = MINUTES.includes(minuteKey) ? minuteKey : "00";
  return { hour, minute, period };
}

function toTime24(hour: number, minute: string, period: "AM" | "PM"): string {
  let h = hour;
  if (period === "AM" && hour === 12) h = 0;
  else if (period === "PM" && hour !== 12) h = hour + 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function displayDate(date: string | null): string {
  if (!date) return "Pick a date";
  try {
    return format(new Date(`${date}T00:00:00`), "EEE, MMM d, yyyy");
  } catch {
    return date;
  }
}

interface SchedulePanelProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
}

export function SchedulePanel({ state, dispatch }: SchedulePanelProps) {
  const { schedule } = state.draft;
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const [optimalOpen, setOptimalOpen] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [extraSlots, setExtraSlots] = React.useState(false);
  const hasDate = !!schedule.date;

  const parsed = React.useMemo(() => parseTime(schedule.time), [schedule.time]);
  const [hour, setHour] = React.useState(parsed.hour);
  const [minute, setMinute] = React.useState(parsed.minute);
  const [period, setPeriod] = React.useState<"AM" | "PM">(parsed.period);

  // Sync if schedule changes externally (e.g. URL pre-fill)
  React.useEffect(() => {
    const p = parseTime(schedule.time);
    setHour(p.hour);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [schedule.time]);

  const commit = (
    d: string | null,
    h: number,
    m: string,
    p: "AM" | "PM",
  ) => {
    dispatch({
      type: "set-schedule",
      schedule: { date: d, time: d ? toTime24(h, m, p) : null },
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    commit(e.target.value || null, hour, minute, period);
  };

  const handleHour = (v: number) => {
    setHour(v);
    commit(schedule.date, v, minute, period);
  };
  const handleMinute = (v: string) => {
    setMinute(v);
    commit(schedule.date, hour, v, period);
  };
  const handlePeriod = (v: "AM" | "PM") => {
    setPeriod(v);
    commit(schedule.date, hour, minute, v);
  };

  const applyOptimal = (t: (typeof OPTIMAL_TIMES)[number]) => {
    setHour(t.h);
    setMinute(t.m);
    setPeriod(t.p);
    setOptimalOpen(false);
    commit(schedule.date, t.h, t.m, t.p);
  };

  const clearSchedule = () => {
    dispatch({ type: "set-schedule", schedule: { date: null, time: null } });
  };

  return (
    <CollapsiblePanel
      title="Show draft on calendar"
      description="Optional — pick a date and time so this draft appears on the calendar."
      icon={<CalendarDays className="h-3.5 w-3.5" />}
      open={state.panels.schedule}
      onOpenChange={() =>
        dispatch({ type: "toggle-panel", panel: "schedule" })
      }
      rightSlot={
        hasDate ? (
          <Badge variant="brand">Scheduled</Badge>
        ) : (
          <Badge variant="outline">Optional</Badge>
        )
      }
    >
      <div className="space-y-4">
        {/* ── Date + Time row ── */}
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          {/* Date trigger */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Date
            </span>
            <div className="relative">
              {/* Invisible native date input layered over the button */}
              <input
                ref={dateInputRef}
                type="date"
                value={schedule.date ?? ""}
                onChange={handleDateChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Schedule date"
              />
              <div
                className={cn(
                  "flex h-8 items-center gap-2 rounded-md border border-border bg-card px-3 text-[12px] pointer-events-none",
                  hasDate ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {displayDate(schedule.date)}
              </div>
            </div>
          </div>

          {/* Time dropdowns */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Time
            </span>
            <div className="flex items-center gap-1">
              <select
                value={hour}
                onChange={(e) => handleHour(parseInt(e.target.value, 10))}
                className="h-8 w-[3.2rem] rounded-md border border-border bg-card px-1 text-center text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-[14px] font-medium text-muted-foreground">
                :
              </span>
              <select
                value={minute}
                onChange={(e) => handleMinute(e.target.value)}
                className="h-8 w-[3.4rem] rounded-md border border-border bg-card px-1 text-center text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => handlePeriod(e.target.value as "AM" | "PM")}
                className="h-8 w-[3.4rem] rounded-md border border-border bg-card px-1 text-center text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Optimal times */}
          <div className="relative flex flex-col gap-1">
            <span className="invisible text-[11px]">·</span>
            <button
              type="button"
              onClick={() => setOptimalOpen((v) => !v)}
              className="flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-[hsl(var(--brand))] transition-colors hover:bg-[hsl(var(--brand))]/8"
            >
              <Sparkles className="h-3 w-3" />
              Use Optimal Times
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  optimalOpen && "rotate-180",
                )}
              />
            </button>
            {optimalOpen ? (
              <div className="absolute top-full left-0 z-30 mt-1 w-36 overflow-hidden rounded-md border border-border bg-popover shadow-md">
                {OPTIMAL_TIMES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyOptimal(t)}
                    className="flex w-full items-center px-3 py-2 text-left text-[12px] text-foreground transition-colors hover:bg-muted"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Clear */}
          {hasDate ? (
            <button
              type="button"
              onClick={clearSchedule}
              aria-label="Clear schedule"
              className="mb-0.5 self-end rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Extra slot placeholder */}
        {extraSlots ? (
          <div className="flex flex-col gap-1.5 rounded-md border border-dashed border-border p-3 text-[11px] text-muted-foreground">
            Support for multiple scheduled times per post is coming soon.
          </div>
        ) : null}

        {/* ── Link row ── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => setExtraSlots((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--brand))] transition-colors hover:underline"
          >
            <Plus className="h-3 w-3" />
            Add more scheduled times
          </button>

          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--brand))] transition-colors hover:underline"
          >
            <Settings2 className="h-3 w-3" />
            Advanced Scheduling
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                advancedOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Advanced accordion */}
        {advancedOpen ? (
          <div className="rounded-md bg-muted/40 px-3 py-2.5 text-[11px] text-muted-foreground">
            Advanced options (recurring schedules, timezone overrides, bulk
            scheduling) are coming in a future update.
          </div>
        ) : null}
      </div>
    </CollapsiblePanel>
  );
}
