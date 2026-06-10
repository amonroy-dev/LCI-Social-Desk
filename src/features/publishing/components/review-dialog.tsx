"use client";

import * as React from "react";
import {
  CheckCheck,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Mail,
  Send,
} from "lucide-react";

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
import type { Client, SocialPostDraft } from "@/lib/types";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SocialPostDraft;
  client?: Client;
  emailConfigured: boolean;
  onSubmitted: (result: {
    url: string;
    reviewId: string;
    draft: SocialPostDraft;
    sentTo: string | null;
  }) => void;
}

type SubmitState =
  | { phase: "idle" }
  | { phase: "submitting"; action: "email" | "link" }
  | { phase: "error"; message: string }
  | {
      phase: "success";
      url: string;
      reviewId: string;
      sentTo: string | null;
      emailError: string | null;
    };

export function ReviewDialog({
  open,
  onOpenChange,
  draft,
  client,
  emailConfigured,
  onSubmitted,
}: ReviewDialogProps) {
  const [contactName, setContactName] = React.useState(client?.primaryContactName ?? "");
  const [contactEmail, setContactEmail] = React.useState(client?.primaryContactEmail ?? "");
  const [state, setState] = React.useState<SubmitState>({ phase: "idle" });
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setState({ phase: "idle" });
      setCopied(false);
      setContactName(client?.primaryContactName ?? "");
      setContactEmail(client?.primaryContactEmail ?? "");
    }
  }, [open, client]);

  const submit = async (action: "email" | "link") => {
    if (action === "email" && !contactEmail.trim()) {
      setState({
        phase: "error",
        message: "Enter the client's email address to send the review email.",
      });
      return;
    }
    setState({ phase: "submitting", action });
    try {
      const res = await fetch("/api/posts/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          reviewerName: contactName.trim() || null,
          reviewerEmail: contactEmail.trim() || null,
          sendEmail: action === "email",
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
      setState({
        phase: "success",
        url: json.url,
        reviewId: json.review.id,
        sentTo: json.sentTo ?? null,
        emailError: json.emailError ?? null,
      });
      onSubmitted({
        url: json.url,
        reviewId: json.review.id,
        draft: json.draft,
        sentTo: json.sentTo ?? null,
      });
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
                Client contact email{" "}
                {emailConfigured ? (
                  <span className="text-destructive">*</span>
                ) : (
                  <span className="text-muted-foreground">(optional)</span>
                )}
              </Label>
              <Input
                id="reviewer-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jamie@client.com"
                disabled={state.phase === "submitting"}
              />
              {emailConfigured ? (
                <p className="text-[11.5px] text-muted-foreground">
                  We&rsquo;ll email the link directly to the client via Resend.
                </p>
              ) : (
                <p className="text-[11.5px] text-muted-foreground">
                  Email isn&rsquo;t configured for this environment. Use
                  <span className="font-medium"> Copy link </span>and send it
                  yourself, or set <code className="font-mono">RESEND_API_KEY</code>{" "}
                  to enable direct send.
                </p>
              )}
            </div>
            {state.phase === "error" ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                {state.message}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {state.sentTo ? (
              <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800">
                <Mail className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold">
                    Review email sent to {state.sentTo}.
                  </div>
                  <div>
                    The link is unique to your client and expires in 7 days. The
                    audit log records each open and decision.
                  </div>
                </div>
              </div>
            ) : (
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
            )}

            {state.emailError ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
                <span className="font-semibold">
                  Link created, but email failed:
                </span>{" "}
                {state.emailError}
              </div>
            ) : null}

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
                variant={emailConfigured ? "outline" : "brand"}
                size="sm"
                onClick={() => submit("link")}
                disabled={state.phase === "submitting"}
              >
                {state.phase === "submitting" && state.action === "link" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LinkIcon className="h-3.5 w-3.5" />
                )}
                Copy link
              </Button>
              {emailConfigured ? (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => submit("email")}
                  disabled={
                    state.phase === "submitting" || !contactEmail.trim()
                  }
                >
                  {state.phase === "submitting" && state.action === "email" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  Send email
                </Button>
              ) : null}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
