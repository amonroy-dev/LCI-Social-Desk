"use client";

import * as React from "react";
import Link from "next/link";
import {
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Client, SocialPostDraft } from "@/lib/types";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { ListView } from "./list-view";

type CalendarView = "month" | "week" | "list";

interface CalendarClientProps {
  initialPosts: SocialPostDraft[];
  clients: Client[];
}

export function CalendarClient({ initialPosts, clients }: CalendarClientProps) {
  const [view, setView] = React.useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = React.useState(() => new Date());
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(
    null,
  );
  const [posts, setPosts] = React.useState(initialPosts);

  const handleDelete = React.useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const filteredPosts = React.useMemo(() => {
    if (!selectedClientId) return posts;
    return posts.filter((p) => p.clientId === selectedClientId);
  }, [posts, selectedClientId]);

  const postsByDate = React.useMemo(() => {
    const map = new Map<string, SocialPostDraft[]>();
    for (const post of filteredPosts) {
      if (!post.schedule.date) continue;
      const k = post.schedule.date;
      map.set(k, [...(map.get(k) ?? []), post]);
    }
    return map;
  }, [filteredPosts]);

  const goNext = () => {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
  };

  const goPrev = () => {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const navTitle = React.useMemo(() => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return "All Posts";
  }, [view, currentDate]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const activeClients = clients.filter((c) => !c.archivedAt);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page header */}
      <header className="flex h-14 shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card/80 px-5 backdrop-blur">
        <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
          Calendar
        </h1>

        {/* View switcher */}
        <div className="flex items-center rounded-md border border-border bg-muted/30 p-0.5">
          <ViewTab
            active={view === "month"}
            onClick={() => setView("month")}
            icon={<LayoutGrid className="h-3.5 w-3.5" />}
            label="Month"
          />
          <ViewTab
            active={view === "week"}
            onClick={() => setView("week")}
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Week"
          />
          <ViewTab
            active={view === "list"}
            onClick={() => setView("list")}
            icon={<List className="h-3.5 w-3.5" />}
            label="List"
          />
        </div>

        {/* Date navigation — hidden in list view */}
        {view !== "list" ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[150px] text-center text-[13px] font-medium">
              {navTitle}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goNext}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="xs"
              className="ml-1 h-7"
              onClick={goToday}
            >
              Today
            </Button>
          </div>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {/* Client filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="xs"
                className="h-7 gap-1.5 text-[11px]"
              >
                {selectedClient ? selectedClient.name : "Viewing all"}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSelectedClientId(null)}>
                All clients
              </DropdownMenuItem>
              {activeClients.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New post */}
          <Link href="/dashboard/publishing/new">
            <Button variant="brand" size="xs" className="h-7 gap-1 text-[11px]">
              <Plus className="h-3.5 w-3.5" />
              New Post
            </Button>
          </Link>
        </div>
      </header>

      {/* Calendar content */}
      <div className="flex flex-1 flex-col overflow-auto">
        {view === "month" ? (
          <MonthView
            currentDate={currentDate}
            postsByDate={postsByDate}
            clients={clients}
            onDelete={handleDelete}
          />
        ) : null}
        {view === "week" ? (
          <WeekView
            currentDate={currentDate}
            postsByDate={postsByDate}
            clients={clients}
            onDelete={handleDelete}
          />
        ) : null}
        {view === "list" ? (
          <ListView posts={filteredPosts} clients={clients} onDelete={handleDelete} />
        ) : null}
      </div>
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
