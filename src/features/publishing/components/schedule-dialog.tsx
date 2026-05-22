"use client";

import * as React from "react";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ScheduleState } from "@/lib/types";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ScheduleState;
  onConfirm: (schedule: ScheduleState) => void;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: ScheduleDialogProps) {
  const defaults = React.useMemo(() => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  }, []);

  const [date, setDate] = React.useState(initial.date ?? defaults.date);
  const [time, setTime] = React.useState(initial.time ?? defaults.time);

  React.useEffect(() => {
    if (open) {
      setDate(initial.date ?? defaults.date);
      setTime(initial.time ?? defaults.time);
    }
  }, [open, initial, defaults]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[hsl(var(--brand))]" />
            Schedule post
          </DialogTitle>
          <DialogDescription>
            The post will move to scheduled state and queue for publishing at
            the selected time. All times are in your local timezone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="schedule-time">Time</Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="brand"
            size="sm"
            onClick={() => {
              onConfirm({ date, time });
              onOpenChange(false);
            }}
          >
            Confirm schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
