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

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (client: Client) => void;
}

interface FormState {
  name: string;
  industry: string;
  primaryContactName: string;
  primaryContactEmail: string;
  website: string;
  notes: string;
  /** Tailwind class string from CLIENT_ACCENT_PALETTE. Empty = auto-suggest. */
  accent: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  industry: "",
  primaryContactName: "",
  primaryContactEmail: "",
  website: "",
  notes: "",
  accent: "",
};

const NOTES_LIMIT = 500;

export function AddClientDialog({
  open,
  onOpenChange,
  onCreated,
}: AddClientDialogProps) {
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const effectiveAccent = form.accent || suggestAccent(form.name || "Client");
  const shortCode = deriveShortCode(form.name || "Client");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!form.name.trim()) {
      setError("Add a client name to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          industry: form.industry.trim() || null,
          primaryContactName: form.primaryContactName.trim() || null,
          primaryContactEmail: form.primaryContactEmail.trim() || null,
          website: form.website.trim() || null,
          notes: form.notes.trim() || null,
          accent: form.accent || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not add the client.");
        return;
      }
      onCreated(json.client as Client);
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
            Add a client
          </DialogTitle>
          <DialogDescription>
            Add a brand or business you&rsquo;ll manage social for. You can
            connect Facebook and Instagram accounts to this client after it&rsquo;s
            created.
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
                {form.name.trim() || "New client"}
              </div>
              <div className="truncate text-[11.5px] text-muted-foreground">
                {form.industry.trim() || "Industry not set"}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="client-name">
                Brand / business name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="client-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Northshore Dental"
                autoFocus
                required
                disabled={submitting}
                maxLength={80}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="client-industry">Industry</Label>
              <Input
                id="client-industry"
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                placeholder="e.g. Healthcare"
                disabled={submitting}
                maxLength={60}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="client-website">Website</Label>
              <Input
                id="client-website"
                type="url"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://"
                disabled={submitting}
                maxLength={200}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="client-contact-name">Primary contact name</Label>
              <Input
                id="client-contact-name"
                value={form.primaryContactName}
                onChange={(e) => set("primaryContactName", e.target.value)}
                placeholder="e.g. Dr. Lin Tran"
                disabled={submitting}
                maxLength={80}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="client-contact-email">Primary contact email</Label>
              <Input
                id="client-contact-email"
                type="email"
                value={form.primaryContactEmail}
                onChange={(e) => set("primaryContactEmail", e.target.value)}
                placeholder="owner@brand.com"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Brand color</Label>
            <div className="flex flex-wrap gap-1.5">
              <ColorOption
                value=""
                selectedValue={form.accent}
                onSelect={() => set("accent", "")}
                label="Auto"
                isAuto
              />
              {CLIENT_ACCENT_PALETTE.map((p) => (
                <ColorOption
                  key={p.value}
                  value={p.value}
                  swatchClass={p.swatch}
                  selectedValue={form.accent}
                  onSelect={() => set("accent", p.value)}
                  label={p.label}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Used for this client&rsquo;s tag chip throughout the dashboard.
              &quot;Auto&quot; picks deterministically from the brand name.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="client-notes">Notes</Label>
            <Textarea
              id="client-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value.slice(0, NOTES_LIMIT))}
              placeholder="Internal-only notes: brand voice, do-not-mention list, contract dates, etc."
              rows={3}
              disabled={submitting}
            />
            <div className="flex justify-end text-[10.5px] tabular-nums text-muted-foreground">
              {form.notes.length} / {NOTES_LIMIT}
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
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={submitting || !form.name.trim()}
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Building2 className="h-3.5 w-3.5" />
              )}
              Add client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ColorOption({
  value,
  swatchClass,
  selectedValue,
  onSelect,
  label,
  isAuto,
}: {
  value: string;
  swatchClass?: string;
  selectedValue: string;
  onSelect: () => void;
  label: string;
  isAuto?: boolean;
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
        isSelected
          ? "border-foreground ring-2 ring-foreground/20"
          : "border-border hover:border-foreground/40",
        isAuto && "bg-card",
        !isAuto && swatchClass,
      )}
    >
      {isAuto ? (
        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Auto
        </span>
      ) : isSelected ? (
        <Check className="h-3.5 w-3.5 text-white drop-shadow" />
      ) : null}
    </button>
  );
}
