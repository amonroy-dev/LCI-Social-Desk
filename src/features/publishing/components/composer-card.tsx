"use client";

import * as React from "react";
import { Layers, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { Client } from "@/lib/types";
import type { ComposerAction, ComposerState } from "../state";
import { ClientSwitcher } from "./client-switcher";
import { ComposerToolbar } from "./composer-toolbar";
import { MediaUploader, type MediaUploaderHandle } from "./media-uploader";
import { NetworkToggles } from "./network-toggles";

const CAPTION_LIMIT = 2200;

interface ComposerCardProps {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
  clients: Client[];
}

export function ComposerCard({ state, dispatch, clients }: ComposerCardProps) {
  const { draft } = state;
  const captionLength = draft.caption.length;
  const overLimit = captionLength > CAPTION_LIMIT;

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const mediaRef = React.useRef<MediaUploaderHandle>(null);
  // Save selection before focus leaves the textarea (e.g. when clicking toolbar)
  const selectionRef = React.useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "set-caption", caption: e.target.value });
  };

  const saveSelection = () => {
    const el = textareaRef.current;
    if (el) {
      selectionRef.current = {
        start: el.selectionStart ?? draft.caption.length,
        end: el.selectionEnd ?? draft.caption.length,
      };
    }
  };

  const insertAtCursor = (text: string) => {
    const { start, end } = selectionRef.current;
    const caption = draft.caption;
    const newCaption = caption.slice(0, start) + text + caption.slice(end);
    dispatch({ type: "set-caption", caption: newCaption });
    // Restore focus + move cursor after inserted text
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
        selectionRef.current = { start: pos, end: pos };
      }
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
            <Pencil className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
              Composer
            </h2>
            <p className="text-[11.5px] text-muted-foreground">
              Compose once, deliver across selected networks.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClientSwitcher
            clientId={draft.clientId}
            clients={clients}
            onChange={(clientId) => dispatch({ type: "set-client", clientId })}
          />
          <Separator orientation="vertical" className="h-7" />
          <NetworkToggles
            selected={draft.networks}
            onToggle={(network) =>
              dispatch({ type: "toggle-network", network })
            }
          />
        </div>
      </div>

      <Separator />

      <CardContent className="space-y-4 pt-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={draft.caption}
            onChange={handleCaptionChange}
            onSelect={saveSelection}
            onKeyUp={saveSelection}
            onClick={saveSelection}
            placeholder="Your first post starts here. Save a draft to preview how it will look across networks."
            className="min-h-[160px] resize-y pr-20 text-[13.5px] leading-relaxed"
            maxLength={CAPTION_LIMIT + 200}
          />
          <span
            className={`pointer-events-none absolute bottom-2 right-3 font-mono text-[10.5px] tabular-nums ${
              overLimit ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {captionLength.toLocaleString()} / {CAPTION_LIMIT.toLocaleString()}
          </span>
        </div>

        <MediaUploader
          ref={mediaRef}
          media={draft.media}
          onAdd={(assets) => dispatch({ type: "add-media", media: assets })}
          onRemove={(id) => dispatch({ type: "remove-media", id })}
        />
      </CardContent>

      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-2.5">
        <ComposerToolbar
          onInsertText={insertAtCursor}
          onTriggerMedia={() => mediaRef.current?.triggerUpload()}
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[12px] font-medium text-foreground">
            <Switch
              checked={draft.isDraft}
              onCheckedChange={() => dispatch({ type: "toggle-draft" })}
              aria-label="Save as draft"
            />
            <span>This is a Draft</span>
          </label>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Customize by Network
          </Button>
        </div>
      </div>
    </Card>
  );
}
