"use client";

import * as React from "react";
import { CheckCheck, Copy, ExternalLink, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SocialPostDraft } from "@/lib/types";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SocialPostDraft;
  onSubmitted: (result: {
    url: string;
    reviewId: string;
    draft: SocialPostDraft;
  }) => void;
}

type SubmitState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "error"; message: string }
  | { phase: "success"; url: string; reviewId: string };

export function ReviewDialog({
  open,
  onOpenChange,
  draft,
  onSubmitted,
}: ReviewDialogProps) {
  const [contactName, setContactName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [state, setState] = React.useState<SubmitState>({ phase: "idle" });
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setState({ phase: "idle" });
      setCopied(false);
    }
  }, [open]);

  const submit = async () => {
    setState({ phase: "submitting" });
    try {
      const res = await fetch("/api/posts/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          reviewerName: contactName.trim() || null,
          reviewerEmail: contactEmail.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setState({
          phase: "error",
          message: json.error || "Could not create review link.",
        });
        return;
      }
      setState({ phase: "success", url: json.url, reviewId: json.review.id });
      onSubmitted({ url: json.url, reviewId: json.review.id, draft: json.draft });
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Network error.",
      });
    }
  };

  const copy = async () => {
    if (state.phase !== "success") return;
    try {
      await navigator.clipboard.writeText(state.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may not be available; fall back to selecting the input
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-[hsl(var(--brand))]" />
            Send for client approval
          </DialogTitle>
          <DialogDescription>
            Generate a secure, expiring review link the client can open without
            signing in. They&rsquo;ll see the post previews and can approve or
            request changes.
          </DialogDescription>
        </DialogHeader>

        {state.phase !== "success" ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="reviewer-name">Client contact name (optional)</Label>
              <Input
                id="reviewer-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Jamie Chen"
                disabled={state.phase === "submitting"}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reviewer-email">
                Client contact email (optional)
              </Label>
              <Input
                id="reviewer-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jamie@client.com"
                disabled={state.phase === "submitting"}
              />
              <p className="text-[11.5px] text-muted-foreground">
                We&rsquo;ll record this on the review for your records. Sending
                the email is handled by your account manager.
              </p>
            </div>
            {state.phase === "error" ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                {state.message}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800">
              <CheckCheck className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-semibold">Review link ready.</div>
                <div>
                  Share this with the client. The link expires in 7 days and
                  records each open + decision in the audit log.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={state.url}
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-[12px]"
              />
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <a
              href={state.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--brand))] hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open review preview
            </a>
          </div>
        )}

        <DialogFooter>
          {state.phase === "success" ? (
            <DialogClose asChild>
              <Button variant="brand" size="sm">
                Done
              </Button>
            </DialogClose>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="brand"
                size="sm"
                onClick={submit}
                disabled={state.phase === "submitting"}
              >
                {state.phase === "submitting" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Generate review link
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
