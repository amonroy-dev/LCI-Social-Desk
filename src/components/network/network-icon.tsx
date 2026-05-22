import * as React from "react";

import { cn } from "@/lib/utils";
import type { NetworkId } from "@/lib/types";

interface NetworkIconProps extends React.SVGAttributes<SVGSVGElement> {
  network: NetworkId;
}

/**
 * Original, minimal mono-line glyphs that suggest each network without copying
 * any provider's exact trademark, color, or proportions. Color and size are
 * controlled by Tailwind on the parent.
 */
export function NetworkIcon({ network, className, ...props }: NetworkIconProps) {
  if (network === "facebook") {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-3.5 w-3.5", className)}
        aria-hidden
        {...props}
      >
        <rect x="2" y="2" width="12" height="12" rx="2.5" />
        <path d="M10 5h-.75A1.25 1.25 0 0 0 8 6.25V8H6.75M8 14V8h1.75l.25-1.5H8" />
      </svg>
    );
  }
  if (network === "instagram") {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-3.5 w-3.5", className)}
        aria-hidden
        {...props}
      >
        <rect x="2" y="2" width="12" height="12" rx="3.25" />
        <circle cx="8" cy="8" r="2.5" />
        <circle cx="11.6" cy="4.4" r="0.55" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-3.5 w-3.5", className)}
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="12" height="12" rx="1.75" />
      <path d="M5 7v4M5 5v0.01M7.5 11V8.25c0-.7.55-1.25 1.25-1.25S10 7.55 10 8.25V11M7.5 7v4" />
    </svg>
  );
}
