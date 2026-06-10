"use client";

import * as React from "react";
import { Bell, Menu, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMobileNav } from "./mobile-nav-context";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { toggle } = useMobileNav();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-3 sm:px-5 backdrop-blur">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={toggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex min-w-0 flex-col leading-tight">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-[11.5px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 text-[11px]">
          Internal Use Only
        </Badge>
        <div className="hidden lg:flex h-8 w-52 items-center gap-2 rounded-md border border-border bg-muted/60 px-2.5 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span>Search drafts, clients…</span>
          <kbd className="ml-auto rounded border border-border bg-card px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
