"use client";

import * as React from "react";
import Link from "next/link";
import { format, isToday, parseISO } from "date-fns";
import { CalendarClock, Edit3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Client, SocialPostDraft } from "@/lib/types";
import { PostCard } from "./post-card";

interface ListViewProps {
  posts: SocialPostDraft[];
  clients: Client[];
  onDelete?: (id: string) => void;
}

export function ListView({ posts, clients, onDelete }: ListViewProps) {
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const unscheduled = posts.filter((p) => !p.schedule.date);
  const scheduled = posts
    .filter((p) => !!p.schedule.date)
    .sort((a, b) => {
      const da = `${a.schedule.date} ${a.schedule.time ?? "00:00"}`;
      const db = `${b.schedule.date} ${b.schedule.time ?? "00:00"}`;
      return da.localeCompare(db);
    });

  const byDate = new Map<string, SocialPostDraft[]>();
  for (const post of scheduled) {
    const k = post.schedule.date!;
    byDate.set(k, [...(byDate.get(k) ?? []), post]);
  }
  const sortedDates = Array.from(byDate.keys()).sort();

  if (posts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-[14px] font-medium text-muted-foreground">
          No posts yet
        </p>
        <div className="flex gap-2">
          <Link href="/dashboard/publishing/new">
            <Button variant="outline" size="sm">
              <Edit3 className="h-3.5 w-3.5" />
              Start a Draft
            </Button>
          </Link>
          <Link href="/dashboard/publishing/new">
            <Button variant="brand" size="sm">
              <CalendarClock className="h-3.5 w-3.5" />
              Schedule Post
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-4">
      {unscheduled.length > 0 ? (
        <section className="mb-6">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Unscheduled Drafts
          </h3>
          <div className="flex flex-col gap-1.5">
            {unscheduled.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                client={clientMap.get(post.clientId)}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ) : null}

      {sortedDates.map((dateKey) => {
        const dayPosts = byDate.get(dateKey)!;
        const date = parseISO(dateKey);
        const today = isToday(date);

        return (
          <section key={dateKey} className="mb-4">
            <h3
              className={cn(
                "mb-2 flex items-center gap-2 text-[13px] font-semibold",
                today ? "text-[hsl(var(--brand))]" : "text-foreground",
              )}
            >
              {format(date, "EEEE, MMMM d, yyyy")}
              {today ? (
                <span className="rounded-full bg-[hsl(var(--brand))]/10 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--brand))]">
                  Today
                </span>
              ) : null}
            </h3>
            <div className="flex flex-col gap-1.5">
              {dayPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  client={clientMap.get(post.clientId)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
