"use client";

import * as React from "react";
import Link from "next/link";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarClock, Edit3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Client, SocialPostDraft } from "@/lib/types";
import { PostCard } from "./post-card";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE = 3;

interface MonthViewProps {
  currentDate: Date;
  postsByDate: Map<string, SocialPostDraft[]>;
  clients: Client[];
}

export function MonthView({ currentDate, postsByDate, clients }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd });
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const showClient = clients.length > 1;

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/20">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="flex flex-1 flex-col divide-y divide-border">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid min-h-[140px] flex-1 grid-cols-7 divide-x divide-border"
          >
            {week.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayPosts = postsByDate.get(key) ?? [];
              const visible = dayPosts.slice(0, MAX_VISIBLE);
              const overflow = dayPosts.length - MAX_VISIBLE;
              const inCurrentMonth = isSameMonth(day, currentDate);
              const today = isToday(day);

              return (
                <DayCell
                  key={key}
                  dateKey={key}
                  day={day}
                  posts={visible}
                  overflow={overflow}
                  inCurrentMonth={inCurrentMonth}
                  today={today}
                  clientMap={clientMap}
                  showClient={showClient}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DayCellProps {
  day: Date;
  dateKey: string;
  posts: SocialPostDraft[];
  overflow: number;
  inCurrentMonth: boolean;
  today: boolean;
  clientMap: Map<string, Client>;
  showClient: boolean;
}

function DayCell({
  day,
  dateKey,
  posts,
  overflow,
  inCurrentMonth,
  today,
  clientMap,
  showClient,
}: DayCellProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col gap-1 overflow-hidden p-2 transition-colors",
        !inCurrentMonth && "bg-muted/10",
        hovered && inCurrentMonth && "bg-muted/5",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Today ring */}
      {today ? (
        <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-[hsl(var(--brand))]/60" />
      ) : null}

      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium tabular-nums",
            today
              ? "bg-[hsl(var(--brand))] text-white"
              : inCurrentMonth
              ? "text-foreground"
              : "text-muted-foreground/40",
          )}
        >
          {format(day, "d")}
        </span>
        {hovered && inCurrentMonth ? (
          <Link
            href={`/dashboard/publishing/new?date=${dateKey}`}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Link>
        ) : null}
      </div>

      {/* Post cards */}
      <div className="flex flex-col gap-0.5">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            client={showClient ? clientMap.get(post.clientId) : undefined}
          />
        ))}
        {overflow > 0 ? (
          <p className="px-1 text-[9px] font-medium text-muted-foreground">
            +{overflow} more
          </p>
        ) : null}
      </div>

      {/* Hover action buttons */}
      {hovered && inCurrentMonth ? (
        <div className="mt-1 flex flex-col gap-1">
          <Link href={`/dashboard/publishing/new?date=${dateKey}`}>
            <Button
              variant="outline"
              size="xs"
              className="h-7 w-full justify-start text-[11px]"
            >
              <CalendarClock className="h-3 w-3" />
              Schedule Post
            </Button>
          </Link>
          <Link href="/dashboard/publishing/new">
            <Button
              variant="brand"
              size="xs"
              className="h-7 w-full justify-start text-[11px]"
            >
              <Edit3 className="h-3 w-3" />
              Start a Draft
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
