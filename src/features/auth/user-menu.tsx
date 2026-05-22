"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert, UserCircle2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { describeRole } from "@/lib/auth/roles";
import { cn, initialsOf } from "@/lib/utils";
import { getFirebaseAuth } from "@/lib/firebase/client";
import type { SessionUser } from "@/lib/types";

interface UserMenuProps {
  session: SessionUser;
  variant?: "sidebar" | "topbar";
}

export function UserMenu({ session, variant = "sidebar" }: UserMenuProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const onSignOut = async () => {
    setPending(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" }).catch(() => null);
      const auth = getFirebaseAuth();
      if (auth) {
        const { signOut } = await import("firebase/auth");
        await signOut(auth).catch(() => null);
      }
      router.replace("/sign-in");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  if (variant === "sidebar") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-[10.5px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/10 transition-colors hover:bg-white/15"
          title={`${session.name} · ${describeRole(session.role)}`}
        >
          {initialsOf(session.name || session.email)}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-[220px]">
          <UserCard session={session} />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onSelect={(event) => {
              event.preventDefault();
              onSignOut();
            }}
            className="gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-left text-xs transition-colors hover:bg-muted",
        )}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase">
          {initialsOf(session.name || session.email)}
        </span>
        <div className="hidden flex-col leading-tight md:flex">
          <span className="truncate text-[12px] font-medium">{session.name}</span>
          <span className="truncate text-[10.5px] text-muted-foreground">
            {describeRole(session.role)}
            {session.demo ? " · Demo" : ""}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <UserCard session={session} />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            onSignOut();
          }}
          className="gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserCard({ session }: { session: SessionUser }) {
  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        <UserCircle2 className="h-3.5 w-3.5" />
        Signed in
      </DropdownMenuLabel>
      <div className="px-2 pb-1">
        <div className="text-[12.5px] font-semibold tracking-tight text-foreground">
          {session.name}
        </div>
        <div className="text-[11px] text-muted-foreground">{session.email}</div>
        <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
          {describeRole(session.role)}
        </div>
        {session.demo ? (
          <div className="mt-1.5 flex items-start gap-1.5 rounded border border-amber-300 bg-amber-50 px-1.5 py-1 text-[10.5px] text-amber-900">
            <ShieldAlert className="mt-0.5 h-3 w-3" />
            Demo session — Firebase auth not configured.
          </div>
        ) : null}
      </div>
    </>
  );
}
