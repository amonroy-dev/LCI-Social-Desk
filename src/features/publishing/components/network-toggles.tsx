"use client";

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NetworkIcon } from "@/components/network/network-icon";
import { NETWORKS } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import type { NetworkId } from "@/lib/types";

interface NetworkTogglesProps {
  selected: NetworkId[];
  onToggle: (network: NetworkId) => void;
}

export function NetworkToggles({ selected, onToggle }: NetworkTogglesProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-1.5">
        {NETWORKS.map((n) => {
          const isOn = selected.includes(n.id);
          return (
            <Tooltip key={n.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onToggle(n.id)}
                  aria-pressed={isOn}
                  aria-label={`${n.label} ${isOn ? "selected" : "off"}`}
                  className={cn(
                    "relative inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                    isOn
                      ? "border-[hsl(var(--brand))]/40 bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))] shadow-sm"
                      : "border-border bg-muted/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <NetworkIcon network={n.id} />
                  {isOn ? (
                    <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))] ring-2 ring-card" />
                  ) : null}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {n.label} · {isOn ? "Selected" : "Off"}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
