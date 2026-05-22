import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getCurrentSession } from "@/lib/auth/server";
import {
  isDemoModeEnabled,
  isFirebaseClientConfigured,
} from "@/lib/firebase/config";
import { SignInForm } from "@/features/auth/sign-in-form";

interface PageProps {
  searchParams: Promise<{ next?: string; reason?: string }>;
}

export const metadata: Metadata = {
  title: "Sign in — LCI Social Desk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: PageProps) {
  const { next, reason } = await searchParams;
  const session = await getCurrentSession();
  if (session) {
    redirect(next || "/dashboard/publishing/new");
  }

  const firebaseConfigured = isFirebaseClientConfigured();
  const demoEnabled = isDemoModeEnabled();

  return (
    <main className="min-h-screen bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_minmax(380px,440px)]">
        <section className="hidden flex-col justify-between p-10 lg:flex">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--brand))]/15 text-[hsl(var(--sidebar-accent))] ring-1 ring-[hsl(var(--brand))]/30">
              <span className="font-mono text-[12px] font-bold">LCI</span>
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-white">
                LCI Social Desk
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[hsl(var(--sidebar-muted))]">
                Internal agency workspace
              </div>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <Badge variant="outline" className="border-white/10 bg-white/5 text-[hsl(var(--sidebar-foreground))]">
              <Lock className="h-3 w-3" /> Internal Use Only
            </Badge>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-white">
              Sign in to compose, schedule, and publish on behalf of your
              client accounts.
            </h1>
            <p className="text-[13px] leading-relaxed text-[hsl(var(--sidebar-muted))]">
              This workspace is restricted to LCI agency team members. Client
              social account connections happen through individually-issued
              secure invite links — clients never need a dashboard account.
            </p>
          </div>

          <div className="text-[11px] text-[hsl(var(--sidebar-muted))]">
            © {new Date().getFullYear()} LCI Social Desk · Internal build
          </div>
        </section>

        <section className="flex items-center justify-center bg-card p-6 text-foreground lg:p-10">
          <div className="w-full max-w-sm space-y-6">
            <div className="lg:hidden">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
                  <span className="font-mono text-[11px] font-bold">LCI</span>
                </span>
                <span className="text-sm font-semibold tracking-tight">
                  LCI Social Desk
                </span>
              </div>
            </div>

            <header className="space-y-1.5">
              <h2 className="text-[18px] font-semibold tracking-tight">
                Sign in
              </h2>
              <p className="text-[12.5px] text-muted-foreground">
                Use your agency Google account to access the dashboard. Sessions
                are bound to this device for 12 hours.
              </p>
              {reason === "forbidden" ? (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11.5px] text-amber-800">
                  Your account does not have access to that area. Ask an owner
                  to upgrade your role.
                </p>
              ) : null}
            </header>

            <SignInForm
              firebaseConfigured={firebaseConfigured}
              demoEnabled={demoEnabled}
            />

            <p className="text-[11px] text-muted-foreground">
              Need to connect social accounts for a client?{" "}
              <Link
                href="/"
                className="font-medium text-[hsl(var(--brand))] hover:underline"
              >
                Clients use a separate secure invite link
              </Link>
              — they should not sign in here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
