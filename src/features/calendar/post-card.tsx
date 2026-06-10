"use client";

import * as React from "react";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Tag,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkIcon } from "@/components/network/network-icon";
import type { Client, NetworkId, SocialPostDraft } from "@/lib/types";

const STATUS_CONFIG: Record<
  SocialPostDraft["status"],
  { border: string; bg: string }
> = {
  draft:             { border: "border-l-amber-400",                      bg: "bg-amber-50 dark:bg-amber-950/20" },
  pending_review:    { border: "border-l-amber-500",                      bg: "bg-amber-50 dark:bg-amber-950/20" },
  changes_requested: { border: "border-l-red-500",                        bg: "bg-red-50 dark:bg-red-950/20" },
  approved:          { border: "border-l-green-500",                      bg: "bg-green-50 dark:bg-green-950/20" },
  scheduled:         { border: "border-l-[hsl(var(--brand))]",            bg: "bg-blue-50 dark:bg-blue-950/20" },
  published:         { border: "border-l-emerald-500",                    bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  simulated:         { border: "border-l-violet-400",                     bg: "bg-violet-50 dark:bg-violet-950/20" },
  failed:            { border: "border-l-red-600",                        bg: "bg-red-50 dark:bg-red-950/20" },
};

/** Convert "14:30" → "2:30 pm" */
function formatTime(time: string | null): string | null {
  if (!time) return null;
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m} ${period}`;
}

interface PostCardProps {
  post: SocialPostDraft;
  client?: Client;
}

export function PostCard({ post, client }: PostCardProps) {
  const cfg = STATUS_CONFIG[post.status];
  const time = formatTime(post.schedule.time);

  return (
    <div
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded border border-border/60 border-l-[3px] transition-shadow hover:shadow-md",
        cfg.border,
        cfg.bg,
      )}
    >
      {/* ── Header: draft icon + network logos + time ── */}
      <div className="flex items-center gap-1.5 px-2 pt-1.5">
        <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
        <div className="flex shrink-0 items-center gap-0.5">
          {post.networks.map((net) => (
            <NetworkIcon
              key={net}
              network={net as NetworkId}
              className="h-[14px] w-[14px]"
            />
          ))}
        </div>
        {time ? (
          <span className="ml-auto shrink-0 text-[10px] font-bold text-foreground">
            {time}
          </span>
        ) : null}
      </div>

      {/* ── Body: caption ── */}
      <div className="px-2 py-1">
        <p className="line-clamp-2 text-[11px] leading-snug text-foreground">
          {post.caption.trim() ? (
            post.caption
          ) : (
            <span className="italic text-muted-foreground">No caption</span>
          )}
        </p>
        {client ? (
          <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
            {client.name}
          </p>
        ) : null}
      </div>

      {/* ── Footer: ... + action icons ── */}
      <div className="flex items-center justify-between px-1.5 pb-1.5 pt-0.5">
        <button
          type="button"
          aria-label="More options"
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-black/8 hover:text-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconBtn aria-label="Tag"><Tag className="h-3 w-3" /></IconBtn>
          <IconBtn aria-label="Team conversation"><MessageSquare className="h-3 w-3" /></IconBtn>
          <IconBtn aria-label="Preview"><Eye className="h-3 w-3" /></IconBtn>
          <IconBtn aria-label="Edit"><Pencil className="h-3 w-3" /></IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  "aria-label": label,
}: {
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-black/8 hover:text-foreground"
    >
      {children}
    </button>
  );
}
