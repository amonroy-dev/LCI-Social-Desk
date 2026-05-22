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
import { cn } from "@/lib/utils";
import { SAMPLE_CLIENTS } from "@/lib/sample-data";
import type { Client } from "@/lib/types";

interface ClientSwitcherProps {
  clientId: string;
  onChange: (clientId: string) => void;
}

export function ClientSwitcher({ clientId, onChange }: ClientSwitcherProps) {
  const active =
    SAMPLE_CLIENTS.find((c) => c.id === clientId) ?? SAMPLE_CLIENTS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
        <ClientChip client={active} />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[13px] font-medium text-foreground">
            {active.name}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {active.industry} · Client account
          </span>
        </div>
        <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel>Client accounts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SAMPLE_CLIENTS.map((c) => {
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
                  {c.industry}
                </span>
              </div>
              {isActive ? (
                <Check className="ml-auto h-3.5 w-3.5 text-[hsl(var(--brand))]" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
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
