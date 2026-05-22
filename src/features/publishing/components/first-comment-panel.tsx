"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ComposerAction, ComposerState } from "../state";
import { CollapsiblePanel } from "./collapsible-panel";

const LIMIT = 1000;

interface FirstCommentPanelProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
}

export function FirstCommentPanel({ state, dispatch }: FirstCommentPanelProps) {
  const value = state.draft.firstComment;
  const length = value.length;

  return (
    <CollapsiblePanel
      title="First Comment"
      description="Optional — posts immediately after the main caption."
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
        profiles. Useful for links, credits, or hashtag stacks.
      </p>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) =>
            dispatch({
              type: "set-first-comment",
              firstComment: e.target.value,
            })
          }
          placeholder="Add a comment that posts immediately after publishing…"
          className="min-h-[90px] pr-20 text-[13px]"
          maxLength={LIMIT + 100}
        />
        <span
          className={`pointer-events-none absolute bottom-2 right-3 font-mono text-[10.5px] tabular-nums ${
            length > LIMIT ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {length.toLocaleString()} / {LIMIT.toLocaleString()}
        </span>
      </div>
    </CollapsiblePanel>
  );
}
