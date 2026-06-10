"use client";

import * as React from "react";
import { Building2, Check, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CLIENT_ACCENT_PALETTE,
  deriveShortCode,
  suggestAccent,
} from "@/lib/sample-data";
import type { Client } from "@/lib/types";

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onUpdated: (client: Client) => void;
}

const NOTES_LIMIT = 500;

export function EditClientDialog({
  open,
  onOpenChange,
  client,
  onUpdated,
}: EditClientDialogProps) {
  const [name, setName] = React.useState(client.name);
  const [industry, setIndustry] = React.useState(client.industry ?? "");
  const [primaryContactName, setPrimaryContactName] = React.useState(client.primaryContactName ?? "");
  const [primaryContactEmail, setPrimaryContactEmail] = React.useState(client.primaryContactEmail ?? "");
  const [website, setWebsite] = React.useState(client.website ?? "");
  const [notes, setNotes] = React.useState(client.notes ?? "");
  const [accent, setAccent] = React.useState(client.accent ?? "");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName(client.name);
      setIndustry(client.industry ?? "");
      setPrimaryContactName(client.primaryContactName ?? "");
      setPrimaryContactEmail(client.primaryContactEmail ?? "");
      setWebsite(client.website ?? "");
      setNotes(client.notes ?? "");
      setAccent(client.accent ?? "");
      setError(null);
    }
  }, [open, client]);

  const effectiveAccent = accent || suggestAccent(name || "Client");
  const shortCode = deriveShortCode(name || "Client");

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!name.trim()) { setError("Client name is required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients?clientId=${encodeURIComponent(client.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry: industry.trim() || null,
          primaryContactName: primaryContactName.trim() || null,
          primaryContactEmail: primaryContactEmail.trim() || null,
          website: website.trim() || null,
          notes: notes.trim() || null,
          accent: accent || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Could not update the client."); return; }
      onUpdated(json.client as Client);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[hsl(var(--brand))]" />
            Edit client
          </DialogTitle>
          <DialogDescription>
            Update contact details, industry, and brand settings for {client.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Live preview chip */}
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md text-[12px] font-semibold tracking-tight",
                effectiveAccent,
              )}
              aria-hidden
            >
              {shortCode}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13.5px] font-medium text-foreground">
                {name.trim() || "Client name"}
              </div>
              <div className="truncate text-[11.5px] text-muted-foreground">
                {industry.trim() || "Industry not set"}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="edit-client-name">
                Brand / business name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                maxLength={80}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-client-industry">Industry</Label>
              <Input
                id="edit-client-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Healthcare"
                disabled={submitting}
                maxLength={60}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-client-website">Website</Label>
              <Input
                id="edit-client-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                disabled={submitting}
                maxLength={200}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-contact-name">Primary contact name</Label>
              <Input
                id="edit-contact-name"
                value={primaryContactName}
                onChange={(e) => setPrimaryContactName(e.target.value)}
                placeholder="e.g. Dr. Lin Tran"
                disabled={submitting}
                maxLength={80}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-contact-email">Primary contact email</Label>
              <Input
                id="edit-contact-email"
                type="email"
                value={primaryContactEmail}
                onChange={(e) => setPrimaryContactEmail(e.target.value)}
                placeholder="owner@brand.com"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Brand color</Label>
            <div className="flex flex-wrap gap-1.5">
              <ColorOption value="" selectedValue={accent} onSelect={() => setAccent("")} label="Auto" isAuto />
              {CLIENT_ACCENT_PALETTE.map((p) => (
                <ColorOption
                  key={p.value}
                  value={p.value}
                  swatchClass={p.swatch}
                  selectedValue={accent}
                  onSelect={() => setAccent(p.value)}
                  label={p.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-client-notes">Notes</Label>
            <Textarea
              id="edit-client-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, NOTES_LIMIT))}
              placeholder="Internal-only notes: brand voice, do-not-mention list, etc."
              rows={3}
              disabled={submitting}
            />
            <div className="flex justify-end text-[10.5px] tabular-nums text-muted-foreground">
              {notes.length} / {NOTES_LIMIT}
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="brand" size="sm" disabled={submitting || !name.trim()}>
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ColorOption({
  value, swatchClass, selectedValue, onSelect, label, isAuto,
}: {
  value: string; swatchClass?: string; selectedValue: string;
  onSelect: () => void; label: string; isAuto?: boolean;
}) {
  const isSelected = selectedValue === value;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`Brand color: ${label}`}
      title={label}
      className={cn(
        "relative flex h-7 w-7 items-center justify-center rounded-md border transition-all",
        isSelected ? "border-foreground ring-2 ring-foreground/20" : "border-border hover:border-foreground/40",
        isAuto && "bg-card",
        !isAuto && swatchClass,
      )}
    >
      {isAuto ? (
        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">Auto</span>
      ) : isSelected ? (
        <Check className="h-3.5 w-3.5 text-white drop-shadow" />
      ) : null}
    </button>
  );
}
