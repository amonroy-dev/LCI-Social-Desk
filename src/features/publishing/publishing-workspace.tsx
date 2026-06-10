"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import type { Client, ScheduleState, SocialPostDraft } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const [mobilePreviewOpen, setMobilePreviewOpen] = React.useState(false);

  return (
    <div className="grid min-h-0 flex-1 overflow-hidden grid-cols-1 gap-0 lg:grid-cols-2">
      {/* ── Composer side ── */}
      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden lg:border-r lg:border-border">
        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-3 pb-2 pt-4 sm:px-6 sm:pt-5">
          <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
            {/* Preview toggle — mobile only, above composer */}
            <div className="flex items-center justify-end lg:hidden">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-[12px]"
                onClick={() => setMobilePreviewOpen((v) => !v)}
              >
                {mobilePreviewOpen ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Preview Post
                  </>
                )}
              </Button>
            </div>

            <ComposerCard state={state} dispatch={dispatch} clients={clients} />
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

      {/* ── Preview side ── */}
      <aside
        className={cn(
          "min-w-0 flex min-h-0 flex-col overflow-hidden bg-muted/30 px-4 pb-6 pt-4 sm:px-5 sm:pt-5",
          // Desktop: always visible
          "lg:flex",
          // Mobile: toggled via button
          mobilePreviewOpen ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PreviewPanel state={state} clients={clients} />
        </div>
      </aside>
    </div>
  );
}
