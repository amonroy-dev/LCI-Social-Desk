"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ComposerAction, ComposerState } from "../state";
import { CollapsiblePanel } from "./collapsible-panel";

interface WorkflowsPanelProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
}

export function WorkflowsPanel({ state, dispatch }: WorkflowsPanelProps) {
  return (
    <CollapsiblePanel
      title="Publishing Workflows"
      description="Approval and review routing for outbound content."
      icon={<ShieldCheck className="h-3.5 w-3.5" />}
      open={state.panels.workflows}
      onOpenChange={() => dispatch({ type: "toggle-panel", panel: "workflows" })}
      rightSlot={<Badge variant="outline">Disabled</Badge>}
    >
      <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border bg-muted/40 p-4">
        <p className="text-[12.5px] text-muted-foreground">
          Approval workflows are currently disabled for this internal
          workspace. Content posts directly from the assigned account manager
          once a draft is approved internally.
        </p>
        <Button variant="outline" size="sm" disabled>
          Add Approval Workflow Later
        </Button>
      </div>
    </CollapsiblePanel>
  );
}
