"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  onDelete?: (id: string) => void;
}

export function PostCard({ post, client, onDelete }: PostCardProps) {
  const router = useRouter();
  const cfg = STATUS_CONFIG[post.status];
  const time = formatTime(post.schedule.time);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/publishing/${post.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      setConfirmOpen(false);
      onDelete?.(post.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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

        {/* ── Footer: edit + delete ── */}
        <div className="flex items-center justify-end gap-0.5 px-1.5 pb-1.5 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconBtn aria-label="Edit" onClick={handleEdit}>
            <Pencil className="h-3 w-3" />
          </IconBtn>
          <IconBtn aria-label="Delete" destructive onClick={handleDeleteClick}>
            <Trash2 className="h-3 w-3" />
          </IconBtn>
        </div>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              This will permanently delete the post
              {post.caption.trim()
                ? `: "${post.caption.slice(0, 60)}${post.caption.length > 60 ? "…" : ""}"`
                : ""}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function IconBtn({
  children,
  "aria-label": label,
  destructive,
  onClick,
}: {
  children: React.ReactNode;
  "aria-label": string;
  destructive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded transition-colors",
        destructive
          ? "text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40"
          : "text-muted-foreground hover:bg-black/8 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
