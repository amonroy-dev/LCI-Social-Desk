"use client";

import * as React from "react";
import { Check, Copy, Link, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ClientInvite, SupportedNetwork } from "@/lib/types";

interface InviteGeneratorProps {
  clientId: string;
  clientName: string;
  emailConfigured: boolean;
  defaultContactName?: string | null;
  defaultContactEmail?: string | null;
}

interface InviteResponse {
  invite: ClientInvite;
  url: string;
  sentTo?: string;
}

export function InviteGenerator({ clientId, clientName, emailConfigured, defaultContactName, defaultContactEmail }: InviteGeneratorProps) {
  const [contactName, setContactName] = React.useState(defaultContactName ?? "");
  const [email, setEmail] = React.useState(defaultContactEmail ?? "");
  const [networks, setNetworks] = React.useState<SupportedNetwork[]>([
    "facebook",
    "instagram",
  ]);
  const [pending, setPending] = React.useState<"send" | "link" | null>(null);
  const [result, setResult] = React.useState<InviteResponse | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggle = (n: SupportedNetwork) => {
    setNetworks((existing) =>
      existing.includes(n) ? existing.filter((x) => x !== n) : [...existing, n],
    );
  };

  const sendInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter the client's email address to send the invite.");
      return;
    }
    setError(null);
    setPending("send");
    try {
      const res = await fetch("/api/invites/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientId,
          contactName: contactName.trim() || null,
          email: email.trim(),
          allowedNetworks: networks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not send invite.");
      }
      setResult(data as InviteResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPending(null);
    }
  };

  const generateLink = async () => {
    setError(null);
    setPending("link");
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientId,
          contactName: contactName.trim() || null,
          email: email.trim() || null,
          allowedNetworks: networks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create invite.");
      }
      setResult(data as InviteResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPending(null);
    }
  };

  const copy = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setEmail(defaultContactEmail ?? "");
    setContactName(defaultContactName ?? "");
  };

  if (result) {
    return (
      <div className="space-y-3">
        {result.sentTo ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50/80 p-3">
            <p className="text-[13px] font-medium text-emerald-900">
              <Mail className="mr-1.5 inline-block h-3.5 w-3.5" />
              Invite sent to {result.sentTo}
            </p>
            <p className="mt-1 text-[11.5px] text-emerald-700">
              They&apos;ll receive an email with a button to connect their {result.invite.allowedNetworks.join(" and ")}. 
              The link expires in 14 days.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Secure invite link — send this to the client
            </Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                readOnly
                value={result.url}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="font-mono text-[11.5px]"
              />
              <Button type="button" variant="outline" size="sm" onClick={copy}>
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Expires {new Date(result.invite.expiresAt).toLocaleString()} ·
              Networks: {result.invite.allowedNetworks.join(", ")}
            </p>
          </div>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Send another invite
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={sendInvite} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="invite-contact">Contact name</Label>
            <Input
              id="invite-contact"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={`${clientName} owner`}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="invite-email">
              Contact email {emailConfigured && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@client.com"
              required={emailConfigured}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Networks the client should connect</Label>
          <div className="flex gap-2">
            {(["facebook", "instagram"] as SupportedNetwork[]).map((n) => {
              const on = networks.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggle(n)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors",
                    on
                      ? "border-[hsl(var(--brand))]/40 bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-pressed={on}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11.5px] text-muted-foreground">
            Invite is valid for 14 days. The client clicks the link to authorize
            without needing an account.
          </p>
          <div className="flex gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending !== null || networks.length === 0}
              onClick={generateLink}
            >
              {pending === "link" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Link className="h-3.5 w-3.5" />
              )}
              Copy link
            </Button>
            {emailConfigured ? (
              <Button
                type="submit"
                variant="brand"
                size="sm"
                disabled={pending !== null || networks.length === 0 || !email.trim()}
              >
                {pending === "send" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                Send invite
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
