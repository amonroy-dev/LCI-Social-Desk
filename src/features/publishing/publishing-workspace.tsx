"use client";

import * as React from "react";

import { ComposerCard } from "./components/composer-card";
import { FirstCommentPanel } from "./components/first-comment-panel";
import { PreviewPanel } from "./components/preview-panel";
import { TagsPanel } from "./components/tags-panel";
import { WorkflowsPanel } from "./components/workflows-panel";
import { ActionBar } from "./components/action-bar";
import { useComposer } from "./state";

interface PublishingWorkspaceProps {
  emailConfigured?: boolean;
}

export function PublishingWorkspace({
  emailConfigured = false,
}: PublishingWorkspaceProps) {
  const [state, dispatch] = useComposer();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)] xl:grid-cols-[minmax(0,1.7fr)_minmax(380px,1fr)]">
        <section className="min-w-0 overflow-auto px-6 pb-2 pt-5 lg:border-r lg:border-border">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <ComposerCard state={state} dispatch={dispatch} />
            <FirstCommentPanel state={state} dispatch={dispatch} />
            <WorkflowsPanel state={state} dispatch={dispatch} />
            <TagsPanel state={state} dispatch={dispatch} />
          </div>
        </section>

        <aside className="min-w-0 overflow-auto bg-muted/30 px-5 pb-6 pt-5">
          <PreviewPanel state={state} />
        </aside>
      </div>
      <ActionBar
        state={state}
        dispatch={dispatch}
        emailConfigured={emailConfigured}
      />
    </div>
  );
}
