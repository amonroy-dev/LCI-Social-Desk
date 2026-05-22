"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CollapsiblePanelProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CollapsiblePanel({
  title,
  description,
  icon,
  open,
  onOpenChange,
  rightSlot,
  children,
  className,
}: CollapsiblePanelProps) {
  const contentId = React.useId();
  return (
    <Card className={cn("overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40"
      >
        {icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <div className="flex min-w-0 flex-col">
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            {title}
          </span>
          {description ? (
            <span className="truncate text-[11.5px] text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {rightSlot}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open ? "rotate-180" : undefined,
            )}
          />
        </div>
      </button>
      {open ? (
        <div
          id={contentId}
          className="border-t border-border px-5 py-4 text-sm"
        >
          {children}
        </div>
      ) : null}
    </Card>
  );
}
