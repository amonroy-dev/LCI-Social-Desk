"use client";

import * as React from "react";

import { initialsOf } from "@/lib/utils";

interface PreviewAvatarProps {
  name: string;
  accent?: string;
}

export function PreviewAvatar({ name, accent }: PreviewAvatarProps) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-tight ${
        accent ?? "bg-muted text-foreground"
      }`}
      aria-hidden
    >
      {initialsOf(name)}
    </div>
  );
}

interface MediaPreviewProps {
  url: string;
  kind: "image" | "video";
  className?: string;
}

export function PreviewMedia({ url, kind, className }: MediaPreviewProps) {
  if (kind === "video") {
    return (
      <video src={url} controls className={`w-full ${className ?? ""}`} muted />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Post media preview"
      className={`w-full ${className ?? ""}`}
    />
  );
}

export function CaptionParagraph({ text }: { text: string }) {
  if (!text.trim()) {
    return (
      <p className="text-[13px] leading-relaxed text-muted-foreground/80">
        Your caption preview will appear here as you type.
      </p>
    );
  }
  return (
    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
      {text}
    </p>
  );
}
