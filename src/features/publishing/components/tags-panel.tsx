"use client";

import * as React from "react";
import { Check, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CONTENT_TAGS } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import type { ComposerAction, ComposerState } from "../state";
import { CollapsiblePanel } from "./collapsible-panel";

interface TagsPanelProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
}

export function TagsPanel({ state, dispatch }: TagsPanelProps) {
  const selected = state.draft.tags;
  return (
    <CollapsiblePanel
      title="Tags"
      description="Internal-only labels for sorting and reporting."
      icon={<Tag className="h-3.5 w-3.5" />}
      open={state.panels.tags}
      onOpenChange={() => dispatch({ type: "toggle-panel", panel: "tags" })}
      rightSlot={
        <Badge variant="outline">
          {selected.length > 0 ? `${selected.length} selected` : "None"}
        </Badge>
      }
    >
      <p className="mb-3 text-[12px] text-muted-foreground">
        Tags help the agency team organize content internally. They are not
        sent to social networks.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CONTENT_TAGS.map((tag) => {
          const isOn = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => dispatch({ type: "toggle-tag", tag })}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11.5px] font-medium transition-colors",
                isOn
                  ? "border-[hsl(var(--brand))]/40 bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isOn ? <Check className="h-3 w-3" /> : null}
              {tag}
            </button>
          );
        })}
      </div>
    </CollapsiblePanel>
  );
}
