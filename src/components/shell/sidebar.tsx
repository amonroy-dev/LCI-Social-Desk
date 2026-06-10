"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Send,
  Settings,
  Users,
  X,
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
import { useMobileNav } from "./mobile-nav-context";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "clients", label: "Clients", icon: Users, href: "/dashboard/clients" },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/dashboard/calendar" },
  { id: "publishing", label: "Publishing", icon: Send, href: "/dashboard/publishing/new" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
] as const;

interface SidebarProps {
  session: SessionUser;
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const { open: mobileOpen, close } = useMobileNav();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex h-screen flex-col border-r border-black/40 bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]",
          // Desktop: always visible in normal flow, 60px icon strip
          "md:relative md:w-[60px] md:shrink-0 md:translate-x-0 md:z-auto",
          // Mobile: fixed overlay panel, slides in from left
          "fixed left-0 top-0 z-50 w-60 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center border-b border-white/5">
          {/* Desktop: centered LCI icon */}
          <div className="hidden md:flex w-full justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--brand))]/15 text-[hsl(var(--sidebar-accent))] ring-1 ring-[hsl(var(--brand))]/30 transition-colors hover:bg-[hsl(var(--brand))]/25"
              aria-label="LCI Social Desk"
            >
              <span className="font-mono text-[11px] font-bold tracking-tight">LCI</span>
            </Link>
          </div>

          {/* Mobile: branding + close button */}
          <div className="flex md:hidden w-full items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[hsl(var(--brand))]/15 ring-1 ring-[hsl(var(--brand))]/30">
                <span className="font-mono text-[9px] font-bold text-[hsl(var(--sidebar-accent))]">LCI</span>
              </span>
              <span className="text-[13px] font-semibold text-white/90">Social Desk</span>
            </div>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white/90"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <TooltipProvider delayDuration={120}>
          <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3 md:items-center">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.id === "publishing"
                  ? pathname.startsWith("/dashboard/publishing")
                  : item.id === "dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "group relative flex items-center rounded-md transition-all duration-100",
                        "text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-white active:opacity-60",
                        // Desktop: icon only, 36×36
                        "md:h-9 md:w-9 md:justify-center",
                        // Mobile: icon + label, full width
                        "h-10 w-full gap-3 px-3 md:gap-0 md:px-0",
                        isActive &&
                          "bg-white/8 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Active indicator line — desktop only */}
                      {isActive ? (
                        <span className="absolute left-[-10px] top-1.5 bottom-1.5 hidden w-[2px] rounded-r-full bg-[hsl(var(--sidebar-accent))] md:block" />
                      ) : null}
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span className="text-[13px] font-medium md:hidden">{item.label}</span>
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

        {/* User menu */}
        <div className="flex flex-col items-center gap-2 border-t border-white/5 px-2 py-3">
          <UserMenu session={session} variant="sidebar" />
        </div>
      </aside>
    </>
  );
}
