"use client";

import * as React from "react";
import {
  CalendarClock,
  CheckCheck,
  Loader2,
  Save,
  Send,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Client, ScheduleState, SocialPostDraft } from "@/lib/types";
import type { ComposerAction, ComposerState } from "../state";
import { ScheduleDialog } from "./schedule-dialog";
import { ReviewDialog } from "./review-dialog";

type Pending = "idle" | "saving" | "scheduling" | "posting";

interface ActionBarProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
  clients: Client[];
  emailConfigured?: boolean;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json as T;
}

export function ActionBar({
  state,
  dispatch,
  clients,
  emailConfigured = false,
}: ActionBarProps) {
  const { draft } = state;
  const client = clients.find((c) => c.id === draft.clientId);
  const [pending, setPending] = React.useState<Pending>("idle");
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [lastMessage, setLastMessage] = React.useState<string | null>(null);
  const [lastError, setLastError] = React.useState<string | null>(null);

  const canPublish =
    draft.networks.length > 0 && draft.caption.trim().length > 0;
  const canRequestReview = canPublish;

  const runSave = async () => {
    setPending("saving");
    setLastError(null);
    try {
      const { draft: updated, event } = await postJSON<{
        draft: SocialPostDraft;
        event: { id: string; type: string; message: string; at: string };
      }>("/api/posts/save", { draft });
      dispatch({ type: "merge-draft", draft: updated });
      dispatch({
        type: "log-event",
        event: { ...event, type: event.type as never },
      });
      setLastMessage("Draft saved");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending("idle");
    }
  };

  const runSchedule = async (schedule: ScheduleState) => {
    setPending("scheduling");
    setLastError(null);
    try {
      const { draft: updated, event } = await postJSON<{
        draft: SocialPostDraft;
        event: { id: string; type: string; message: string; at: string };
      }>("/api/posts/schedule", { draft, schedule });
      dispatch({ type: "merge-draft", draft: updated });
      dispatch({
        type: "log-event",
        event: { ...event, type: event.type as never },
      });
      setLastMessage(`Scheduled for ${schedule.date} at ${schedule.time}`);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Schedule failed");
    } finally {
      setPending("idle");
    }
  };

  const runPublish = async () => {
    if (!canPublish) return;
    setPending("posting");
    setLastError(null);
    try {
      const { draft: updated, event } = await postJSON<{
        draft: SocialPostDraft;
        event: { id: string; type: string; message: string; at: string };
      }>("/api/posts/publish", { draft });
      dispatch({ type: "merge-draft", draft: updated });
      dispatch({
        type: "log-event",
        event: { ...event, type: event.type as never },
      });
      setLastMessage(
        updated.status === "published"
          ? "Published to networks"
          : "Simulated publish complete",
      );
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPending("idle");
    }
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
            {lastError ? (
              <span className="inline-flex items-center gap-1 text-destructive">
                {lastError}
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
              onClick={() => setReviewOpen(true)}
              disabled={pending !== "idle" || !canRequestReview}
              title="Generate a secure link for the client to review and approve"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Send for Approval
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

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        draft={draft}
        client={client}
        emailConfigured={emailConfigured}
        onSubmitted={({ draft: updatedDraft, sentTo }) => {
          dispatch({ type: "merge-draft", draft: updatedDraft });
          setLastMessage(
            sentTo
              ? `Review email sent to ${sentTo}`
              : "Review link ready to share",
          );
        }}
      />
    </>
  );
}

function StatusBadge({ status }: { status: ComposerState["draft"]["status"] }) {
  const map: Record<
    ComposerState["draft"]["status"],
    { label: string; variant: "brand" | "warning" | "success" | "outline" | "destructive" }
  > = {
    draft: { label: "Draft", variant: "brand" },
    pending_review: { label: "Pending review", variant: "warning" },
    changes_requested: { label: "Changes requested", variant: "destructive" },
    approved: { label: "Approved", variant: "success" },
    scheduled: { label: "Scheduled", variant: "warning" },
    published: { label: "Published", variant: "success" },
    simulated: { label: "Simulated", variant: "outline" },
    failed: { label: "Failed", variant: "destructive" },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
