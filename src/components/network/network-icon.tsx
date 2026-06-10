"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { NetworkId } from "@/lib/types";

interface NetworkIconProps {
  network: NetworkId;
  className?: string;
}

export function NetworkIcon({ network, className }: NetworkIconProps) {
  // useId gives a unique string per instance; strip colons so it's a valid SVG id
  const uid = React.useId().replace(/:/g, "");
  const sz = cn("h-[18px] w-[18px] shrink-0", className);

  if (network === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={sz} aria-hidden>
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path
          fill="white"
          d="M14.5 6H13C11.343 6 10 7.343 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.276.224-.5.5-.5H14.5V6z"
        />
      </svg>
    );
  }

  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={sz} aria-hidden>
        <defs>
          <radialGradient id={`ig-${uid}`} cx="30%" cy="107%" r="160%">
            <stop offset="0%" stopColor="#ffd600" />
            <stop offset="15%" stopColor="#ff7a00" />
            <stop offset="40%" stopColor="#ff0069" />
            <stop offset="65%" stopColor="#d300c5" />
            <stop offset="100%" stopColor="#7638fa" />
          </radialGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill={`url(#ig-${uid})`} />
        <rect
          x="6.5" y="6.5" width="11" height="11" rx="3"
          stroke="white" strokeWidth="1.5" fill="none"
        />
        <circle cx="12" cy="12" r="2.8" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="16.2" cy="7.8" r="0.8" fill="white" />
      </svg>
    );
  }

  // LinkedIn
  return (
    <svg viewBox="0 0 24 24" className={sz} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        fill="white"
        d="M7.5 10.5H10V17H7.5V10.5zM8.75 9c-.83 0-1.5-.67-1.5-1.5S7.92 6 8.75 6s1.5.67 1.5 1.5S9.58 9 8.75 9zM18 17h-2.5v-3.5c0-2.3-2.5-2.1-2.5 0V17H10.5V10.5H13v1.2c1.1-2 5-2.2 5 1.9V17z"
      />
    </svg>
  );
}
