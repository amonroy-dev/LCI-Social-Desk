"use client";

import * as React from "react";
import Link from "next/link";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
} from "date-fns";
import { CalendarClock, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Client, SocialPostDraft } from "@/lib/types";
import { PostCard } from "./post-card";

interface WeekViewProps {
  currentDate: Date;
  postsByDate: Map<string, SocialPostDraft[]>;
  clients: Client[];
}

export function WeekView({ currentDate, postsByDate, clients }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  return (
    <div className="flex flex-1 divide-x divide-border overflow-auto">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayPosts = postsByDate.get(key) ?? [];
        const today = isToday(day);

        return (
          <div
            key={key}
            className={cn(
              "group flex flex-1 flex-col",
              today && "bg-[hsl(var(--brand))]/5",
            )}
          >
            {/* Day header */}
            <div
              className={cn(
                "shrink-0 border-b border-border px-3 py-2 text-center",
                today && "bg-[hsl(var(--brand))]/10",
              )}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {format(day, "EEE")}
              </p>
              <span
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-semibold tabular-nums",
                  today
                    ? "bg-[hsl(var(--brand))] text-white"
                    : "text-foreground",
                )}
              >
                {format(day, "d")}
              </span>
            </div>

            {/* Posts */}
            <div className="flex flex-1 flex-col gap-1.5 overflow-auto p-2">
              {dayPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  client={clientMap.get(post.clientId)}
                />
              ))}
              {dayPosts.length === 0 ? (
                <p className="pt-2 text-center text-[10px] text-muted-foreground/40">
                  No posts
                </p>
              ) : null}
            </div>

            {/* Hover quick-add (shown at bottom) */}
            <div className="hidden shrink-0 flex-col gap-1 border-t border-border p-2 group-hover:flex">
              <Link href={`/dashboard/publishing/new?date=${key}`}>
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 w-full text-[11px]"
                >
                  <CalendarClock className="h-3 w-3" />
                  Schedule
                </Button>
              </Link>
              <Link href="/dashboard/publishing/new">
                <Button
                  variant="brand"
                  size="xs"
                  className="h-7 w-full text-[11px]"
                >
                  <Edit3 className="h-3 w-3" />
                  Draft
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
