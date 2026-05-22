import * as React from "react";

/**
 * The /connect surface is the public, client-facing flow. It deliberately
 * lives outside the authenticated /dashboard tree so clients never touch
 * internal pages and the layout shell doesn't render for them.
 */
export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
