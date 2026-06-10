"use client";


import type { Client, ScheduleState, SocialPostDraft } from "@/lib/types";
import { ActionBar } from "./components/action-bar";
import { ComposerCard } from "./components/composer-card";
import { FirstCommentPanel } from "./components/first-comment-panel";
import { PreviewPanel } from "./components/preview-panel";
import { TagsPanel } from "./components/tags-panel";
import { WorkflowsPanel } from "./components/workflows-panel";
import { useComposer } from "./state";

interface PublishingWorkspaceProps {
  clients: Client[];
  emailConfigured?: boolean;
  initialSchedule?: ScheduleState;
  initialDraft?: SocialPostDraft;
}

export function PublishingWorkspace({
  clients,
  emailConfigured = false,
  initialSchedule,
  initialDraft,
}: PublishingWorkspaceProps) {
  const initialClientId = initialDraft?.clientId ?? clients[0]?.id ?? "";
  const [state, dispatch] = useComposer(initialClientId, initialSchedule, initialDraft);

  return (
    <div className="grid min-h-0 flex-1 overflow-hidden grid-cols-1 gap-0 lg:grid-cols-2">
      <section className="min-w-0 flex min-h-0 flex-col overflow-hidden lg:border-r lg:border-border">
        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 pb-2 pt-5">
          <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
            <ComposerCard
              state={state}
              dispatch={dispatch}
              clients={clients}
            />
            <FirstCommentPanel state={state} dispatch={dispatch} />
            <WorkflowsPanel state={state} dispatch={dispatch} />
            <TagsPanel state={state} dispatch={dispatch} />
          </div>
        </div>
        <ActionBar
          state={state}
          dispatch={dispatch}
          clients={clients}
          emailConfigured={emailConfigured}
        />
      </section>

      <aside className="min-w-0 flex min-h-0 flex-col overflow-hidden bg-muted/30 px-5 pb-6 pt-5">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PreviewPanel state={state} clients={clients} />
        </div>
      </aside>
    </div>
  );
}
