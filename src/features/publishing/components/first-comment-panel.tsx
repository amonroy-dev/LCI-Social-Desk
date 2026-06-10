"use client";

import * as React from "react";
import { ImagePlus, MessageSquare, Smile } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComposerAction, ComposerState } from "../state";
import { CollapsiblePanel } from "./collapsible-panel";

const LIMIT = 2200;

interface FirstCommentPanelProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
}

export function FirstCommentPanel({ state, dispatch }: FirstCommentPanelProps) {
  const value = state.draft.firstComment;
  const length = value.length;
  const over = length > LIMIT;

  return (
    <CollapsiblePanel
      title="First Comment"
      description="Add a first comment for Instagram, Facebook, and LinkedIn profiles."
      icon={<MessageSquare className="h-3.5 w-3.5" />}
      open={state.panels.firstComment}
      onOpenChange={() =>
        dispatch({ type: "toggle-panel", panel: "firstComment" })
      }
      rightSlot={
        value.trim().length > 0 ? (
          <Badge variant="brand">Added</Badge>
        ) : (
          <Badge variant="outline">Empty</Badge>
        )
      }
    >
      <p className="mb-2 text-[12px] text-muted-foreground">
        Add a first comment for selected Instagram, Facebook, and LinkedIn
        profiles. Use{" "}
        <span className="text-[hsl(var(--brand))]">
          customize post per network
        </span>{" "}
        to edit or limit first comment to specific networks.
      </p>

      {/* Textarea with bottom toolbar */}
      <div className="overflow-hidden rounded-md border border-border bg-card focus-within:ring-1 focus-within:ring-ring">
        <textarea
          value={value}
          onChange={(e) =>
            dispatch({
              type: "set-first-comment",
              firstComment: e.target.value,
            })
          }
          placeholder="Write your first comment here…"
          maxLength={LIMIT + 100}
          rows={3}
          className="w-full resize-none bg-transparent px-3 pt-3 pb-2 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-2.5 py-1.5">
          <div className="flex items-center gap-1">
            <ToolbarButton aria-label="Add emoji">
              <Smile className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton aria-label="Attach image">
              <ImagePlus className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>
          <span
            className={cn(
              "font-mono text-[10.5px] tabular-nums",
              over ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {length.toLocaleString()} / {LIMIT.toLocaleString()}
          </span>
        </div>
      </div>
    </CollapsiblePanel>
  );
}

function ToolbarButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      {...props}
    >
      {children}
    </button>
  );
}
