import * as React from "react";

import type { SessionUser } from "@/lib/types";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
  session: SessionUser;
}

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar session={session} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
