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
import { CalendarClock, Edit3 } from "lucide-react";
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
            className="grid min-h-[148px] flex-1 grid-cols-7 divide-x divide-border"
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
  const hasPosts = posts.length > 0 || overflow > 0;

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

      {/* Existing post cards */}
      {hasPosts ? (
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
      ) : null}

      {/* ── Hover overlay ── */}
      {hovered && inCurrentMonth ? (
        <div className="flex flex-col gap-1.5">
          {/* Ghost post silhouette — only when no real posts */}
          {!hasPosts ? (
            <div className="rounded-md border border-dashed border-border/70 bg-muted/30 p-2.5">
              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  {/* Fake profile row */}
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    <div className="ml-auto h-1.5 w-7 rounded-full bg-muted-foreground/10" />
                  </div>
                  {/* Fake text lines */}
                  <div className="h-1.5 w-full rounded-full bg-muted-foreground/15" />
                  <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/12" />
                  <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/10" />
                </div>
                {/* Fake image square */}
                <div className="h-10 w-10 shrink-0 rounded bg-muted-foreground/12" />
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <Link href={`/dashboard/publishing/new?date=${dateKey}`}>
            <Button
              variant="outline"
              size="xs"
              className="h-7 w-full justify-start gap-1.5 text-[11px]"
            >
              <CalendarClock className="h-3 w-3 shrink-0" />
              Schedule Post
            </Button>
          </Link>
          <Link href="/dashboard/publishing/new">
            <Button
              variant="brand"
              size="xs"
              className="h-7 w-full justify-start gap-1.5 text-[11px]"
            >
              <Edit3 className="h-3 w-3 shrink-0" />
              Start a Draft
            </Button>
          </Link>

          {/* Dashed icon shortcuts */}
          <div className="flex gap-1">
            <Link
              href={`/dashboard/publishing/new?date=${dateKey}`}
              className="flex flex-1 items-center justify-center rounded border border-dashed border-border/60 py-1.5 text-muted-foreground transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground"
              title="Schedule post"
            >
              <CalendarClock className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/publishing/new"
              className="flex flex-1 items-center justify-center rounded border border-dashed border-border/60 py-1.5 text-muted-foreground transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground"
              title="Start a draft"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
