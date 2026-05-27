"use client";

import * as React from "react";
import { CheckCheck, Loader2, MessageSquareWarning, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewDecisionRecord } from "@/lib/types";

interface ReviewActionsProps {
  token: string;
  initialReviewerName: string | null;
  status: "pending" | "opened" | "approved" | "changes_requested";
  lastDecision: ReviewDecisionRecord | null;
}

type Phase =
  | { kind: "idle" }
  | { kind: "submitting"; decision: "approved" | "changes_requested" }
  | { kind: "error"; message: string }
  | { kind: "approved"; record: ReviewDecisionRecord }
  | { kind: "changes_requested"; record: ReviewDecisionRecord };

export function ReviewActions({
  token,
  initialReviewerName,
  status,
  lastDecision,
}: ReviewActionsProps) {
  const initialPhase: Phase =
    status === "approved" && lastDecision
      ? { kind: "approved", record: lastDecision }
      : status === "changes_requested" && lastDecision
        ? { kind: "changes_requested", record: lastDecision }
        : { kind: "idle" };

  const [reviewerName, setReviewerName] = React.useState(
    initialReviewerName ?? "",
  );
  const [comment, setComment] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>(initialPhase);
  const [requestingChanges, setRequestingChanges] = React.useState(false);

  const submit = async (decision: "approved" | "changes_requested") => {
    if (decision === "changes_requested" && !comment.trim()) {
      setPhase({
        kind: "error",
        message: "Please include a brief note about what to change.",
      });
      return;
    }
    setPhase({ kind: "submitting", decision });
    try {
      const res = await fetch(`/api/reviews/${token}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reviewerName: reviewerName.trim() || null,
          comment: comment.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPhase({
          kind: "error",
          message: json.error || "Could not submit your decision.",
        });
        return;
      }
      const record = json.review.history[json.review.history.length - 1];
      setPhase(
        decision === "approved"
          ? { kind: "approved", record }
          : { kind: "changes_requested", record },
      );
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error.",
      });
    }
  };

  if (phase.kind === "approved") {
    return (
      <DecisionRecorded
        tone="approved"
        title="Approved — thanks!"
        body="The agency has been notified and will schedule or publish the post."
        record={phase.record}
      />
    );
  }
  if (phase.kind === "changes_requested") {
    return (
      <DecisionRecorded
        tone="changes_requested"
        title="Changes requested"
        body="Your notes were sent to the agency. They'll update the post and circle back."
        record={phase.record}
      />
    );
  }

  const submitting = phase.kind === "submitting";
  const errorMessage = phase.kind === "error" ? phase.message : null;

  return (
    <Card className="border-border/80 bg-card p-5">
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
        Your decision
      </h3>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Approve to greenlight publishing, or share what needs to change.
      </p>

      <div className="mt-4 space-y-3">
        <div className="space-y-1">
          <Label htmlFor="reviewer-name">Your name (optional)</Label>
          <Input
            id="reviewer-name"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Recorded with your decision"
          />
        </div>

        {requestingChanges ? (
          <div className="space-y-1">
            <Label htmlFor="reviewer-comment">What needs to change?</Label>
            <Textarea
              id="reviewer-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Please shorten the caption and swap the hero image."
              rows={4}
            />
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="brand"
            size="sm"
            className="sm:flex-1"
            onClick={() => submit("approved")}
            disabled={submitting}
          >
            {submitting && phase.kind === "submitting" && phase.decision === "approved" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ThumbsUp className="h-3.5 w-3.5" />
            )}
            Approve
          </Button>
          {requestingChanges ? (
            <Button
              variant="outline"
              size="sm"
              className="sm:flex-1"
              onClick={() => submit("changes_requested")}
              disabled={submitting}
            >
              {submitting && phase.kind === "submitting" && phase.decision === "changes_requested" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MessageSquareWarning className="h-3.5 w-3.5" />
              )}
              Send changes
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="sm:flex-1"
              onClick={() => {
                setRequestingChanges(true);
                if (phase.kind === "error") setPhase({ kind: "idle" });
              }}
              disabled={submitting}
              type="button"
            >
              <MessageSquareWarning className="h-3.5 w-3.5" />
              Request changes
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function DecisionRecorded({
  tone,
  title,
  body,
  record,
}: {
  tone: "approved" | "changes_requested";
  title: string;
  body: string;
  record: ReviewDecisionRecord;
}) {
  const at = new Date(record.at).toLocaleString();
  return (
    <Card
      className={
        tone === "approved"
          ? "border-emerald-300 bg-emerald-50 p-5"
          : "border-amber-300 bg-amber-50 p-5"
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            "flex h-9 w-9 items-center justify-center rounded-md " +
            (tone === "approved"
              ? "bg-white text-emerald-700"
              : "bg-white text-amber-700")
          }
        >
          {tone === "approved" ? (
            <CheckCheck className="h-4 w-4" />
          ) : (
            <MessageSquareWarning className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0">
          <h3
            className={
              "text-[15px] font-semibold tracking-tight " +
              (tone === "approved" ? "text-emerald-900" : "text-amber-900")
            }
          >
            {title}
          </h3>
          <p
            className={
              "mt-0.5 text-[12.5px] " +
              (tone === "approved" ? "text-emerald-900/80" : "text-amber-900/80")
            }
          >
            {body}
          </p>
          <div className="mt-3 space-y-1 text-[11.5px] text-foreground/80">
            <div>
              <span className="font-medium">Recorded:</span> {at}
            </div>
            {record.reviewerName ? (
              <div>
                <span className="font-medium">Reviewer:</span> {record.reviewerName}
              </div>
            ) : null}
            {record.comment ? (
              <div className="rounded-md border border-border bg-card px-2.5 py-1.5 text-foreground">
                <span className="font-medium">Notes: </span>
                {record.comment}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
