import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        brand:
          "border-[hsl(var(--brand))]/30 bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]",
        warning:
          "border-amber-300 bg-amber-50 text-amber-700",
        success:
          "border-emerald-300 bg-emerald-50 text-emerald-700",
        destructive:
          "border-rose-300 bg-rose-50 text-rose-700",
        ghost: "border-transparent bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
