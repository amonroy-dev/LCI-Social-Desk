// Print route group — renders with only the root layout (no AppShell, no overflow constraints).
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
