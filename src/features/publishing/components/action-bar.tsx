"use client";

import * as React from "react";
import {
  CalendarClock,
  CheckCheck,
  Loader2,
  Save,
  Send,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  publishPost,
  saveDraft,
  schedulePost,
} from "@/lib/services/post-service";
import { getClient } from "@/lib/sample-data";
import type { ScheduleState } from "@/lib/types";
import type { ComposerAction, ComposerState } from "../state";
import { ScheduleDialog } from "./schedule-dialog";

type Pending = "idle" | "saving" | "scheduling" | "posting";

interface ActionBarProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
}

export function ActionBar({ state, dispatch }: ActionBarProps) {
  const { draft } = state;
  const client = getClient(draft.clientId);
  const [pending, setPending] = React.useState<Pending>("idle");
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [lastMessage, setLastMessage] = React.useState<string | null>(null);

  const canPublish =
    draft.networks.length > 0 && draft.caption.trim().length > 0;

  const runSave = async () => {
    setPending("saving");
    const { draft: updated, event } = await saveDraft(draft);
    dispatch({ type: "merge-draft", draft: updated });
    dispatch({ type: "log-event", event });
    setLastMessage("Draft saved");
    setPending("idle");
  };

  const runSchedule = async (schedule: ScheduleState) => {
    setPending("scheduling");
    const { draft: updated, event } = await schedulePost(draft, schedule);
    dispatch({ type: "merge-draft", draft: updated });
    dispatch({ type: "log-event", event });
    setLastMessage(`Scheduled for ${schedule.date} at ${schedule.time}`);
    setPending("idle");
  };

  const runPublish = async () => {
    if (!canPublish) return;
    setPending("posting");
    const { draft: updated, event } = await publishPost(draft);
    dispatch({ type: "merge-draft", draft: updated });
    dispatch({ type: "log-event", event });
    setLastMessage(
      updated.status === "published"
        ? "Published to networks"
        : "Simulated publish complete",
    );
    setPending("idle");
  };

  return (
    <>
      <div className="sticky bottom-0 z-10 mt-4 border-t border-border bg-card/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
            <StatusBadge status={draft.status} />
            {client ? (
              <span className="text-foreground">
                <span className="font-medium">{client.name}</span>
                <span className="text-muted-foreground"> · </span>
                <span>
                  {draft.networks.length === 0
                    ? "No networks selected"
                    : `${draft.networks.length} network${draft.networks.length === 1 ? "" : "s"} selected`}
                </span>
              </span>
            ) : null}
            {draft.schedule.date && draft.schedule.time ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-foreground">
                <CalendarClock className="h-3 w-3" />
                {draft.schedule.date} · {draft.schedule.time}
              </span>
            ) : null}
            {lastMessage ? (
              <span className="inline-flex items-center gap-1 text-[hsl(var(--brand))]">
                <CheckCheck className="h-3 w-3" />
                {lastMessage}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runSave}
              disabled={pending !== "idle"}
            >
              {pending === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleOpen(true)}
              disabled={pending !== "idle" || !canPublish}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Schedule
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={runPublish}
              disabled={pending !== "idle" || !canPublish}
            >
              {pending === "posting" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Post Now
            </Button>
          </div>
        </div>
      </div>

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        initial={draft.schedule}
        onConfirm={runSchedule}
      />
    </>
  );
}

function StatusBadge({ status }: { status: ComposerState["draft"]["status"] }) {
  const map: Record<
    ComposerState["draft"]["status"],
    { label: string; variant: "brand" | "warning" | "success" | "outline" }
  > = {
    draft: { label: "Draft", variant: "brand" },
    scheduled: { label: "Scheduled", variant: "warning" },
    published: { label: "Published", variant: "success" },
    simulated: { label: "Simulated", variant: "outline" },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
