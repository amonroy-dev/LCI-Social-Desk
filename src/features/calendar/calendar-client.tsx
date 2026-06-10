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
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const [posts, setPosts] = React.useState(initialPosts);

  // Default to list view on small screens
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setView("list");
    }
  }, []);

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
      return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
    }
    return "All Posts";
  }, [view, currentDate]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const activeClients = clients.filter((c) => !c.archivedAt);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 border-b border-border bg-card/80 px-3 py-2 backdrop-blur sm:px-5">
        {/* Row 1: title + view tabs + (date nav on sm+) + right actions */}
        <div className="flex flex-wrap items-center gap-2 sm:h-10 sm:flex-nowrap sm:gap-3">
          <h1 className="shrink-0 text-[15px] font-semibold tracking-tight text-foreground">
            Calendar
          </h1>

          {/* View switcher */}
          <div className="flex items-center rounded-md border border-border bg-muted/30 p-0.5">
            <ViewTab active={view === "month"} onClick={() => setView("month")} icon={<LayoutGrid className="h-3.5 w-3.5" />} label="Month" />
            <ViewTab active={view === "week"} onClick={() => setView("week")} icon={<CalendarDays className="h-3.5 w-3.5" />} label="Week" />
            <ViewTab active={view === "list"} onClick={() => setView("list")} icon={<List className="h-3.5 w-3.5" />} label="List" />
          </div>

          {/* Date nav — inline on sm+, hidden on mobile (shown in row 2) */}
          {view !== "list" && (
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrev} aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center text-[13px] font-medium">{navTitle}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNext} aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="xs" className="ml-1 h-7" onClick={goToday}>Today</Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {activeClients.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="xs" className="h-7 max-w-[110px] gap-1 text-[11px]">
                    <span className="truncate">{selectedClient ? selectedClient.name : "All clients"}</span>
                    <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedClientId(null)}>All clients</DropdownMenuItem>
                  {activeClients.map((c) => (
                    <DropdownMenuItem key={c.id} onClick={() => setSelectedClientId(c.id)}>{c.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link href="/dashboard/publishing/new">
              <Button variant="brand" size="xs" className="h-7 gap-1 text-[11px]">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Row 2: date nav on mobile only */}
        {view !== "list" && (
          <div className="mt-1.5 flex items-center gap-1 sm:hidden">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrev} aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex-1 text-center text-[12px] font-medium">{navTitle}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNext} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="xs" className="ml-1 h-7" onClick={goToday}>Today</Button>
          </div>
        )}
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
        "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors sm:px-2.5",
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
