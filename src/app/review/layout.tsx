import * as React from "react";

/**
 * The /review surface is the public, client-facing approval flow. It lives
 * outside the authenticated /dashboard tree so clients never see internal
 * pages and the layout shell doesn't render for them.
 */
export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
