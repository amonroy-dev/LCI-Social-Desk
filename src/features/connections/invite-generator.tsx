"use client";

import * as React from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ClientInvite, SupportedNetwork } from "@/lib/types";

interface InviteGeneratorProps {
  clientId: string;
  clientName: string;
}

interface CreatedInviteResponse {
  invite: ClientInvite;
  url: string;
  token: string;
}

export function InviteGenerator({ clientId, clientName }: InviteGeneratorProps) {
  const [contactName, setContactName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [networks, setNetworks] = React.useState<SupportedNetwork[]>([
    "facebook",
    "instagram",
  ]);
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<CreatedInviteResponse | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggle = (n: SupportedNetwork) => {
    setNetworks((existing) =>
      existing.includes(n) ? existing.filter((x) => x !== n) : [...existing, n],
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
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
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not create invite.");
      }
      const data = (await res.json()) as CreatedInviteResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPending(false);
    }
  };

  const copy = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-3">
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
            <Label htmlFor="invite-email">Contact email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@client.com"
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

        <div className="flex items-center justify-between">
          <p className="text-[11.5px] text-muted-foreground">
            Invite is valid for 14 days. The client opens the link to authorize
            without an LCI Social Desk account.
          </p>
          <Button
            type="submit"
            variant="brand"
            size="sm"
            disabled={pending || networks.length === 0}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Generate invite
          </Button>
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

      {result ? (
        <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Secure invite link
          </Label>
          <div className="flex items-center gap-2">
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
          <p className="text-[11px] text-muted-foreground">
            Expires {new Date(result.invite.expiresAt).toLocaleString()} ·
            Networks: {result.invite.allowedNetworks.join(", ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
