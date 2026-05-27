import * as React from "react";
import type { Metadata } from "next";

import { requireSession } from "@/lib/auth/server";
import { AppShell } from "@/components/shell/app-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return <AppShell session={session}>{children}</AppShell>;
}
