"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  ChevronRight,
  Hash,
  ImagePlus,
  Link as LinkIcon,
  MapPin,
  Smile,
  Sparkles,
  X,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import emojiData from "@emoji-mart/data";
import { cn } from "@/lib/utils";

// Lazy-load emoji picker (large bundle, browser-only)
const EmojiPicker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

interface ComposerToolbarProps {
  onInsertText: (text: string) => void;
  onTriggerMedia: () => void;
}

export function ComposerToolbar({
  onInsertText,
  onTriggerMedia,
}: ComposerToolbarProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-0.5">
        <EmojiButton onInsertText={onInsertText} />
        <HashtagButton onInsertText={onInsertText} />
        <MediaButton onTriggerMedia={onTriggerMedia} />
        <LinkButton onInsertText={onInsertText} />
        <LocationButton onInsertText={onInsertText} />
        <AiButton />
      </div>
    </TooltipProvider>
  );
}

// ─── Shared toolbar button ────────────────────────────────────────────────────

function ToolBtn({
  label,
  children,
  accent,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            accent && "text-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]",
          )}
          aria-label={label}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

// ─── Emoji ────────────────────────────────────────────────────────────────────

function EmojiButton({ onInsertText }: { onInsertText: (t: string) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Add Emoji"
            >
              <Smile className="h-3.5 w-3.5" strokeWidth={1.85} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Add Emoji</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="top"
        align="start"
        className="w-auto border-0 p-0 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <EmojiPicker
          data={emojiData}
          onEmojiSelect={(emoji: { native: string }) => {
            onInsertText(emoji.native);
            setOpen(false);
          }}
          theme="light"
          previewPosition="none"
          skinTonePosition="search"
          maxFrequentRows={2}
        />
      </PopoverContent>
    </Popover>
  );
}

// ─── Hashtag ─────────────────────────────────────────────────────────────────

function HashtagButton({ onInsertText }: { onInsertText: (t: string) => void }) {
  return (
    <ToolBtn label="Hashtag" onClick={() => onInsertText(" #")}>
      <Hash className="h-3.5 w-3.5" strokeWidth={1.85} />
    </ToolBtn>
  );
}

// ─── Media ───────────────────────────────────────────────────────────────────

function MediaButton({ onTriggerMedia }: { onTriggerMedia: () => void }) {
  return (
    <ToolBtn label="Add Media" onClick={onTriggerMedia}>
      <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.85} />
    </ToolBtn>
  );
}

// ─── Link ─────────────────────────────────────────────────────────────────────

function LinkButton({ onInsertText }: { onInsertText: (t: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInsert = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    onInsertText(` ${formatted} `);
    setUrl("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Insert Link"
            >
              <LinkIcon className="h-3.5 w-3.5" strokeWidth={1.85} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Insert Link</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-3"
        onOpenAutoFocus={() => setTimeout(() => inputRef.current?.focus(), 0)}
      >
        <p className="mb-2 text-[12px] font-semibold text-foreground">Insert Link</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
            className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            onClick={handleInsert}
            disabled={!url.trim()}
            className="rounded-md bg-[hsl(var(--brand))] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-40"
          >
            Insert
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Location ─────────────────────────────────────────────────────────────────

const LOCATION_NETWORKS = [
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "instagram", label: "Instagram", color: "#E1306C" },
] as const;

function LocationButton({ onInsertText }: { onInsertText: (t: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [activeNetwork, setActiveNetwork] = React.useState<"facebook" | "instagram" | null>(null);
  const [locationText, setLocationText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleNetworkClick = (id: "facebook" | "instagram") => {
    setActiveNetwork(id);
    setLocationText("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleAdd = () => {
    const trimmed = locationText.trim();
    if (!trimmed || !activeNetwork) return;
    onInsertText(` 📍 ${trimmed}`);
    setLocationText("");
    setActiveNetwork(null);
    setOpen(false);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setActiveNetwork(null);
      setLocationText("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Location"
            >
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.85} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Location</TooltipContent>
      </Tooltip>
      <PopoverContent side="top" align="start" className="w-56 p-0 overflow-hidden">
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-[12px] font-semibold text-foreground">Location</p>
        </div>

        {activeNetwork ? (
          <div className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11.5px] font-medium capitalize text-foreground">
                {activeNetwork}
              </span>
              <button
                type="button"
                onClick={() => setActiveNetwork(null)}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Back"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter your location"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!locationText.trim()}
              className="mt-2 w-full rounded-md bg-[hsl(var(--brand))] py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-40"
            >
              Add Location
            </button>
          </div>
        ) : (
          <div className="py-1">
            {LOCATION_NETWORKS.map((net) => (
              <button
                key={net.id}
                type="button"
                onClick={() => handleNetworkClick(net.id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-sm text-[9px] font-bold text-white"
                    style={{ backgroundColor: net.color }}
                  >
                    {net.label[0]}
                  </span>
                  <span className="text-[13px] text-foreground">{net.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── AI Assist ────────────────────────────────────────────────────────────────

function AiButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--brand))] transition-colors hover:bg-muted"
              aria-label="AI Assist"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.85} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">AI Assist</TooltipContent>
      </Tooltip>
      <PopoverContent side="top" align="start" className="w-64 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" />
          <p className="text-[12px] font-semibold text-foreground">AI Assist</p>
        </div>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
          AI-powered rewrites, tone shifts, and hashtag suggestions are coming
          soon. Check the <span className="font-medium text-foreground">AI Assist</span> tab
          in the preview panel for early access options.
        </p>
      </PopoverContent>
    </Popover>
  );
}
