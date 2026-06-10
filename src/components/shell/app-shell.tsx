import * as React from "react";

import type { SessionUser } from "@/lib/types";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
  session: SessionUser;
}

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar session={session} />
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
