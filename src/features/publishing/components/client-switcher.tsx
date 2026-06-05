"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Client } from "@/lib/types";

interface ClientSwitcherProps {
  clientId: string;
  clients: Client[];
  onChange: (clientId: string) => void;
}

export function ClientSwitcher({ clientId, clients, onChange }: ClientSwitcherProps) {
  const active =
    clients.find((c) => c.id === clientId) ?? clients[0] ?? null;

  if (!active) {
    return (
      <Link
        href="/dashboard/clients"
        className="group flex items-center gap-2 rounded-md border border-dashed border-border bg-card px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Plus className="h-3.5 w-3.5" />
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[13px] font-medium text-foreground">
            Add a client
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            No clients yet
          </span>
        </div>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
        <ClientChip client={active} />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[13px] font-medium text-foreground">
            {active.name}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {active.industry || "Industry not set"} · Client account
          </span>
        </div>
        <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel>Client accounts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {clients.map((c) => {
          const isActive = c.id === active.id;
          return (
            <DropdownMenuItem
              key={c.id}
              onSelect={() => onChange(c.id)}
              className="gap-2.5"
            >
              <ClientChip client={c} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-medium">
                  {c.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {c.industry || "Industry not set"}
                </span>
              </div>
              {isActive ? (
                <Check className="ml-auto h-3.5 w-3.5 text-[hsl(var(--brand))]" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/clients" className="gap-2 text-[hsl(var(--brand))]">
            <Plus className="h-3.5 w-3.5" />
            Add a client
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ClientChip({
  client,
  size = "md",
}: {
  client: Client;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold tracking-tight",
        client.accent,
        size === "sm" ? "h-5 w-5 text-[10px]" : "h-7 w-7 text-[11px]",
      )}
      aria-hidden
    >
      {client.shortCode}
    </span>
  );
}
