import * as React from "react";

import { requireSession } from "@/lib/auth/server";
import { AppShell } from "@/components/shell/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return <AppShell session={session}>{children}</AppShell>;
}
