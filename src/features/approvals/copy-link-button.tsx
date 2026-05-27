"use client";

import * as React from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
  url: string;
  label?: string;
}

export function CopyLinkButton({ url, label = "Copy link" }: CopyLinkButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <div className="inline-flex items-center gap-1.5">
      <Button variant="outline" size="xs" onClick={copy}>
        {copied ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        {copied ? "Copied" : label}
      </Button>
      <Button variant="ghost" size="xs" asChild>
        <a href={url} target="_blank" rel="noreferrer">
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </Button>
    </div>
  );
}
