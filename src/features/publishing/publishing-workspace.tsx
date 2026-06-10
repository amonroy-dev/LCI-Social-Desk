"use client";

import * as React from "react";

import type { Client, ScheduleState } from "@/lib/types";
import { ComposerCard } from "./components/composer-card";
import { FirstCommentPanel } from "./components/first-comment-panel";
import { PreviewPanel } from "./components/preview-panel";
import { SchedulePanel } from "./components/schedule-panel";
import { TagsPanel } from "./components/tags-panel";
import { WorkflowsPanel } from "./components/workflows-panel";
import { ActionBar } from "./components/action-bar";
import { useComposer } from "./state";

interface PublishingWorkspaceProps {
  clients: Client[];
  emailConfigured?: boolean;
  initialSchedule?: ScheduleState;
}

export function PublishingWorkspace({
  clients,
  emailConfigured = false,
  initialSchedule,
}: PublishingWorkspaceProps) {
  const initialClientId = clients[0]?.id ?? "";
  const [state, dispatch] = useComposer(initialClientId, initialSchedule);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* ── Left: composer panels + action bar ── */}
      <section className="flex w-1/2 min-h-0 flex-col overflow-hidden border-r border-border">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            <ComposerCard state={state} dispatch={dispatch} clients={clients} />
            <FirstCommentPanel state={state} dispatch={dispatch} />
            <WorkflowsPanel state={state} dispatch={dispatch} />
            <TagsPanel state={state} dispatch={dispatch} />
            <SchedulePanel state={state} dispatch={dispatch} />
          </div>
        </div>
        {/* Action bar pinned to bottom of the left column only */}
        <ActionBar
          state={state}
          dispatch={dispatch}
          clients={clients}
          emailConfigured={emailConfigured}
        />
      </section>

      {/* ── Right: network preview ── */}
      <aside className="flex w-1/2 min-h-0 flex-col overflow-hidden bg-muted/30">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-5">
          <PreviewPanel state={state} clients={clients} />
        </div>
      </aside>

    </div>
  );
}
