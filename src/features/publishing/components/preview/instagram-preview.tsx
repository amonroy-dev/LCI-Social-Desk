"use client";

import * as React from "react";
import { format } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

import { NetworkIcon } from "@/components/network/network-icon";
import type { Client, MediaAsset } from "@/lib/types";
import { PreviewAvatar, PreviewMedia } from "./preview-shared";

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
  const slug = client.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const dateStr = format(new Date(), "MMM d").toUpperCase();

  return (
    <div className="overflow-hidden">
      {/* Header: avatar + username + IG icon + menu */}
      <header className="flex items-center justify-between px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <PreviewAvatar name={client.name} accent={client.accent} />
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {slug}
            </span>
            <NetworkIcon network="instagram" className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
      </header>

      {/* Square media */}
      <div className="aspect-square w-full bg-muted/60">
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

      {/* Action icons: Heart + Comment only (Sprout shows just these two) */}
      <div className="flex items-center gap-3.5 px-3 pt-2.5 pb-1.5 text-foreground">
        <Heart className="h-[22px] w-[22px]" strokeWidth={1.75} />
        <MessageCircle className="h-[22px] w-[22px]" strokeWidth={1.75} />
      </div>

      {/* Caption: bold username inline + caption text */}
      <div className="px-3 pb-1">
        {caption.trim() ? (
          <p className="text-[13px] leading-relaxed text-foreground">
            <span className="font-semibold">{slug}</span>
            {" "}
            {caption}
          </p>
        ) : (
          <p className="text-[13px] text-muted-foreground/80">
            <span className="font-semibold text-foreground">{slug}</span>
            {" "}
            Your caption will appear here.
          </p>
        )}
      </div>

      {/* Date */}
      <p className="px-3 pb-3 pt-0.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">
        {dateStr}
      </p>
    </div>
  );
}
