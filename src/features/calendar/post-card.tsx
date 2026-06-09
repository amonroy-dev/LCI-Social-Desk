"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Client, SocialPostDraft } from "@/lib/types";

const STATUS_CONFIG: Record<
  SocialPostDraft["status"],
  { border: string; dot: string }
> = {
  draft: { border: "border-l-gray-300", dot: "bg-gray-400" },
  pending_review: { border: "border-l-amber-400", dot: "bg-amber-400" },
  changes_requested: { border: "border-l-red-500", dot: "bg-red-500" },
  approved: { border: "border-l-green-500", dot: "bg-green-500" },
  scheduled: {
    border: "border-l-[hsl(var(--brand))]",
    dot: "bg-[hsl(var(--brand))]",
  },
  published: { border: "border-l-emerald-500", dot: "bg-emerald-500" },
  simulated: { border: "border-l-violet-400", dot: "bg-violet-400" },
};

const NETWORK_CONFIG: Record<string, { abbr: string; bg: string }> = {
  facebook: { abbr: "F", bg: "bg-[#1877F2] text-white" },
  instagram: { abbr: "IG", bg: "bg-[#E1306C] text-white" },
  linkedin: { abbr: "in", bg: "bg-[#0A66C2] text-white" },
};

function NetworkBadge({ network }: { network: string }) {
  const cfg = NETWORK_CONFIG[network];
  if (!cfg) return null;
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[7px] font-bold",
        cfg.bg,
      )}
    >
      {cfg.abbr[0].toUpperCase()}
    </span>
  );
}

interface PostCardProps {
  post: SocialPostDraft;
  client?: Client;
}

export function PostCard({ post, client }: PostCardProps) {
  const status = STATUS_CONFIG[post.status];
  const firstImage = post.media.find((m) => m.kind === "image");

  return (
    <div
      className={cn(
        "relative flex min-h-[46px] cursor-pointer gap-1.5 overflow-hidden rounded border border-border border-l-[3px] bg-card px-2 py-1.5 transition-colors hover:bg-muted/30 hover:shadow-sm",
        status.border,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", status.dot)} />
          {post.schedule.time ? (
            <span className="text-[9px] text-muted-foreground">
              {post.schedule.time}
            </span>
          ) : null}
          <div className="ml-auto flex shrink-0 gap-0.5">
            {post.networks.map((net) => (
              <NetworkBadge key={net} network={net} />
            ))}
          </div>
        </div>
        <p className="line-clamp-2 text-[10px] leading-snug text-foreground">
          {post.caption.trim() ? (
            post.caption
          ) : (
            <span className="italic text-muted-foreground">No caption</span>
          )}
        </p>
        {client ? (
          <p className="truncate text-[9px] text-muted-foreground">
            {client.name}
          </p>
        ) : null}
      </div>
      {firstImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={firstImage.url}
          alt=""
          className="h-10 w-10 shrink-0 self-start rounded object-cover"
        />
      ) : null}
    </div>
  );
}
