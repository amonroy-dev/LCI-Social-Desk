"use client";

import * as React from "react";
import {
  Hash,
  ImagePlus,
  Link as LinkIcon,
  MapPin,
  Smile,
  Sparkles,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "emoji", label: "Emoji", icon: Smile },
  { id: "hashtag", label: "Hashtag", icon: Hash },
  { id: "media", label: "Media", icon: ImagePlus },
  { id: "link", label: "Link", icon: LinkIcon },
  { id: "location", label: "Location", icon: MapPin },
  { id: "ai", label: "AI Assist", icon: Sparkles, accent: true },
] as const;

interface ComposerToolbarProps {
  onToolClick?: (toolId: (typeof TOOLS)[number]["id"]) => void;
}

export function ComposerToolbar({ onToolClick }: ComposerToolbarProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-0.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onToolClick?.(tool.id)}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    "accent" in tool && tool.accent
                      ? "text-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]"
                      : undefined,
                  )}
                  aria-label={tool.label}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{tool.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
