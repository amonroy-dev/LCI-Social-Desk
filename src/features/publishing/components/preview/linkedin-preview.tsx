"use client";

import * as React from "react";
import {
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  ThumbsUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { NetworkIcon } from "@/components/network/network-icon";
import { formatPreviewTimestamp } from "@/lib/utils";
import type { Client, MediaAsset } from "@/lib/types";
import { CaptionParagraph, PreviewAvatar, PreviewMedia } from "./preview-shared";

interface LinkedInPreviewProps {
  client: Client;
  caption: string;
  media: MediaAsset[];
}

export function LinkedInPreview({ client, caption, media }: LinkedInPreviewProps) {
  const hero = media[0];
  return (
    <Card className="overflow-hidden">
      <header className="flex items-start justify-between px-4 pb-2 pt-3.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <PreviewAvatar name={client.name} accent={client.accent} />
          <div className="flex min-w-0 flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-foreground">
                {client.name}
              </span>
              <NetworkIcon network="linkedin" className="text-muted-foreground" />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {client.industry} · Company page
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatPreviewTimestamp()} · Edited
            </span>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </header>

      <div className="px-4 pb-3">
        <CaptionParagraph text={caption} />
      </div>

      {hero ? (
        <div className="border-y border-border bg-muted/40">
          <PreviewMedia url={hero.url} kind={hero.kind} className="max-h-72 object-cover" />
        </div>
      ) : null}

      <div className="flex items-center gap-3 px-4 py-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--brand))]/15 text-[hsl(var(--brand))]">
            <ThumbsUp className="h-2.5 w-2.5" />
          </span>
          Preview reactions
        </span>
        <span className="ml-auto">Preview comments</span>
      </div>

      <div className="flex items-center justify-between border-t border-border px-2 py-1.5 text-[12px] text-muted-foreground">
        <ActionButton icon={<ThumbsUp className="h-3.5 w-3.5" />} label="Like" />
        <ActionButton icon={<MessageCircle className="h-3.5 w-3.5" />} label="Comment" />
        <ActionButton icon={<Repeat2 className="h-3.5 w-3.5" />} label="Repost" />
        <ActionButton icon={<Send className="h-3.5 w-3.5" />} label="Send" />
      </div>
    </Card>
  );
}

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-[12px] font-medium text-muted-foreground"
    >
      {icon}
      {label}
    </button>
  );
}
