"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/lib/types";

interface MediaUploaderProps {
  media: MediaAsset[];
  onAdd: (assets: MediaAsset[]) => void;
  onRemove: (id: string) => void;
}

function toAsset(file: File): MediaAsset {
  return {
    id: `media_${Math.random().toString(36).slice(2, 10)}`,
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    kind: file.type.startsWith("video") ? "video" : "image",
  };
}

export function MediaUploader({ media, onAdd, onRemove }: MediaUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const assets = Array.from(fileList).map(toAsset);
    if (assets.length > 0) onAdd(assets);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "group flex w-full items-center gap-3 rounded-md border border-dashed bg-muted/40 px-3 py-3 text-left transition-colors",
          isDragging
            ? "border-[hsl(var(--brand))]/60 bg-[hsl(var(--brand-soft))]"
            : "border-border hover:border-foreground/30 hover:bg-muted/60",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors",
            "group-hover:text-foreground",
          )}
        >
          <Plus className="h-4 w-4" />
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-[13px] font-medium text-foreground">
            Add image or video
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            Drag and drop or click to attach. JPG, PNG, or MP4 up to 25 MB.
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </button>

      {media.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {media.map((asset) => (
            <div
              key={asset.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
            >
              {asset.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={asset.url}
                  className="h-full w-full object-cover"
                  muted
                />
              )}
              <button
                type="button"
                onClick={() => onRemove(asset.id)}
                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${asset.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
