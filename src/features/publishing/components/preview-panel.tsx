"use client";

import * as React from "react";
import { ChevronDown, Eye, Info, Sparkles, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkIcon } from "@/components/network/network-icon";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/types";
import type { ComposerState } from "../state";
import { FacebookPreview } from "./preview/facebook-preview";
import { InstagramPreview } from "./preview/instagram-preview";
import { LinkedInPreview } from "./preview/linkedin-preview";

interface PreviewPanelProps {
  state: ComposerState;
  clients: Client[];
}

export function PreviewPanel({ state, clients }: PreviewPanelProps) {
  const { draft } = state;
  const client = clients.find((c) => c.id === draft.clientId);

  return (
    <section className="flex h-full flex-col overflow-hidden">
      <Tabs defaultValue="network" className="flex h-full flex-col">
        <div className="sticky top-0 z-10 border-b border-border bg-muted/30 pb-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 py-3 px-0.5">
            <TabsList className="gap-1.5">
              <TabsTrigger value="network" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Network Preview
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI Assist
              </TabsTrigger>
            </TabsList>
            <Badge variant="outline" className="gap-1">
              Live
            </Badge>
          </div>
        </div>

        <TabsContent value="network" className="m-0 flex-1 overflow-hidden">
          {/* Info notice — matches Sprout's network_preview-panel notice */}
          <div className="mb-3 flex gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-snug text-muted-foreground">
              Preview approximates how your content will appear when published.
              Final appearance may vary by platform.
            </p>
          </div>

          <div className="flex h-full min-h-0 flex-col overflow-auto space-y-2 pb-6">
            {draft.networks.length === 0 ? (
              <Card className="border-dashed bg-muted/40 p-6 text-center">
                <div className="mb-1.5 text-[13.5px] font-semibold text-foreground">
                  Start your post to preview it.
                </div>
                <div className="mx-auto max-w-xs text-[12px] leading-relaxed text-muted-foreground">
                  Choose a network, add your caption, and attach media to see a
                  realistic post preview.
                </div>
              </Card>
            ) : null}

            {draft.networks.includes("facebook") && client ? (
              <PreviewSection label="Facebook" networkId="facebook">
                <FacebookPreview
                  client={client}
                  caption={draft.caption}
                  media={draft.media}
                />
              </PreviewSection>
            ) : null}

            {draft.networks.includes("instagram") && client ? (
              <PreviewSection label="Instagram" networkId="instagram">
                <InstagramPreview
                  client={client}
                  caption={draft.caption}
                  media={draft.media}
                />
              </PreviewSection>
            ) : null}

            {draft.networks.includes("linkedin") && client ? (
              <PreviewSection label="LinkedIn" networkId="linkedin">
                <LinkedInPreview
                  client={client}
                  caption={draft.caption}
                  media={draft.media}
                />
              </PreviewSection>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="m-0 flex-1">
          <Card className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
                <WandSparkles className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-[13px] font-semibold tracking-tight">
                  AI Assist
                </h3>
                <p className="text-[11.5px] text-muted-foreground">
                  Brand-safe rewrites and hashtag suggestions.
                </p>
              </div>
            </div>
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[12px] text-muted-foreground">
              Connect an internal AI provider to enable rewrites, tone shifts,
              and hashtag generation. AI Assist is currently scaffolded but not
              wired up for v1.
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Tighten", "Make warmer", "Add hashtags", "Translate"].map(
                (label) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="xs"
                    disabled
                    className="font-medium"
                  >
                    {label}
                  </Button>
                ),
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function PreviewSection({
  label,
  networkId,
  children,
}: {
  label: string;
  networkId: "facebook" | "instagram" | "linkedin";
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Collapsible toggle header — 48px tall, matches Sprout's SproutToggle__trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-12 w-full items-center justify-between border-b border-border/60 px-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-2.5">
          <NetworkIcon network={networkId} />
          <span className="text-[13px] font-semibold text-foreground">
            {label}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            !open && "-rotate-90",
          )}
        />
      </button>
      {open ? (
        /* Gray panel bg + centered white card — matches Sprout's InlineMessagePreview layout */
        <div className="bg-muted/40 px-5 py-5">
          <div className="mx-auto max-w-[360px] overflow-hidden rounded-xl border border-border/50 bg-card shadow-md">
            {children}
          </div>
        </div>
      ) : null}
    </section>
  );
}
