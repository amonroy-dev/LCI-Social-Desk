"use client";

import * as React from "react";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";

import { NetworkIcon } from "@/components/network/network-icon";
import type { Client, MediaAsset } from "@/lib/types";
import { CaptionParagraph, PreviewAvatar, PreviewMedia } from "./preview-shared";

interface InstagramPreviewProps {
  client: Client;
  caption: string;
  media: MediaAsset[];
}

export function InstagramPreview({
  client,
  caption,
  media,
}: InstagramPreviewProps) {
  const hero = media[0];
  return (
    <div className="overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <PreviewAvatar name={client.name} accent={client.accent} />
          <div className="flex min-w-0 flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[12.5px] font-semibold text-foreground">
                {client.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}
              </span>
              <NetworkIcon network="instagram" className="text-muted-foreground" />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {client.industry}
            </span>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </header>

      <div className="aspect-square w-full border-y border-border bg-muted/60">
        {hero ? (
          <PreviewMedia
            url={hero.url}
            kind={hero.kind}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11.5px] text-muted-foreground">
            Square media will appear here.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-muted-foreground">
        <div className="flex items-center gap-3">
          <Heart className="h-4 w-4" />
          <MessageCircle className="h-4 w-4" />
          <Send className="h-4 w-4" />
        </div>
        <Bookmark className="h-4 w-4" />
      </div>

      <div className="px-4 pb-3">
        <p className="mb-1 text-[11.5px] font-medium text-foreground">
          {Math.max(12, caption.length)} likes
        </p>
        <CaptionParagraph text={caption} />
      </div>
    </div>
  );
}
