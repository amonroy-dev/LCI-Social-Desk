"use client";

import * as React from "react";
import { CalendarClock, CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ScheduleState } from "@/lib/types";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ScheduleState;
  onConfirm: (schedule: ScheduleState) => void;
}

function parseDate(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  try { return new Date(`${dateStr}T00:00:00`); } catch { return undefined; }
}

function parseTime24(time: string | null) {
  if (!time) return { hour: 9, minute: "00", period: "AM" as const };
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  const mRaw = parseInt(mStr ?? "0", 10);
  const mRounded = Math.round(mRaw / 5) * 5;
  const minuteStr = String(mRounded % 60).padStart(2, "0");
  const minute = MINUTES.includes(minuteStr) ? minuteStr : "00";
  return { hour, minute, period };
}

function toTime24(hour: number, minute: string, period: "AM" | "PM"): string {
  let h = hour;
  if (period === "AM" && hour === 12) h = 0;
  else if (period === "PM" && hour !== 12) h = hour + 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: ScheduleDialogProps) {
  const [calOpen, setCalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [hour, setHour] = React.useState(9);
  const [minute, setMinute] = React.useState("00");
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

  // Sync from initial when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedDate(parseDate(initial.date));
      const parsed = parseTime24(initial.time);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
    }
  }, [open, initial]);

  const dateLabel = selectedDate
    ? format(selectedDate, "EEE, MMM d, yyyy")
    : "Pick a date";

  const handleConfirm = () => {
    const date = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
    const time = date ? toTime24(hour, minute, period) : null;
    onConfirm({ date, time });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[hsl(var(--brand))]" />
            Schedule post
          </DialogTitle>
          <DialogDescription>
            The post will queue for publishing at the selected time (UTC). Choose
            a date and time, then click Confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date picker */}
          <div className="space-y-1.5">
            <span className="text-[12px] font-medium text-foreground">Date</span>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                    selectedDate ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {dateLabel}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalOpen(false);
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div className="space-y-1.5">
            <span className="text-[12px] font-medium text-foreground">Time (UTC)</span>
            <div className="flex items-center gap-1.5">
              <select
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value, 10))}
                className="h-9 w-[3.4rem] rounded-md border border-border bg-card px-1 text-center text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-sm font-medium text-muted-foreground">:</span>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="h-9 w-[3.6rem] rounded-md border border-border bg-card px-1 text-center text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
                className="h-9 w-[3.6rem] rounded-md border border-border bg-card px-1 text-center text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button
            variant="brand"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedDate}
          >
            Confirm schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
