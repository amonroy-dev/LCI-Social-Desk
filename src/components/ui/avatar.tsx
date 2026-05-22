import * as React from "react";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }
>(({ className, size = "md", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-semibold text-foreground",
      size === "sm" && "h-6 w-6",
      size === "md" && "h-8 w-8 text-xs",
      size === "lg" && "h-10 w-10 text-sm",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

export { Avatar };
