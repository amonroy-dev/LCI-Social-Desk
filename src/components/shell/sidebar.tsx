"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  Send,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserMenu } from "@/features/auth/user-menu";
import type { SessionUser } from "@/lib/types";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "clients", label: "Clients", icon: Users, href: "/dashboard/clients" },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
    href: "/dashboard/calendar",
  },
  {
    id: "publishing",
    label: "Publishing",
    icon: Send,
    href: "/dashboard/publishing/new",
  },
  {
    id: "media",
    label: "Media Library",
    icon: ImageIcon,
    href: "/dashboard/media",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
] as const;

interface SidebarProps {
  session: SessionUser;
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex h-screen w-[60px] shrink-0 flex-col items-stretch overflow-hidden border-r border-black/40 bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
      <div className="flex h-14 items-center justify-center border-b border-white/5">
        <Link
          href="/dashboard/publishing/new"
          className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--brand))]/15 text-[hsl(var(--sidebar-accent))] ring-1 ring-[hsl(var(--brand))]/30 transition-colors hover:bg-[hsl(var(--brand))]/25"
          aria-label="LCI Social Desk"
        >
          <span className="font-mono text-[11px] font-bold tracking-tight">
            LCI
          </span>
        </Link>
      </div>

      <TooltipProvider delayDuration={120}>
        <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.id === "publishing"
                ? pathname.startsWith("/dashboard/publishing")
                : pathname === item.href;
            const Icon = item.icon;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex h-9 w-9 items-center justify-center rounded-md text-[hsl(var(--sidebar-muted))] transition-colors",
                      "hover:bg-white/5 hover:text-white",
                      isActive &&
                        "bg-white/8 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive ? (
                      <span className="absolute left-[-10px] top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-[hsl(var(--sidebar-accent))]" />
                    ) : null}
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-1">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>

      <div className="flex flex-col items-center gap-2 border-t border-white/5 px-2 py-3">
        <UserMenu session={session} variant="sidebar" />
      </div>
    </aside>
  );
}
