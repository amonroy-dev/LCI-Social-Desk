import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Lock, ShieldCheck, TimerOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getClient } from "@/lib/sample-data";
import {
  markInviteOpened,
  resolveInviteToken,
} from "@/lib/services/invite-service";
import { listConnectionsForClient } from "@/lib/services/connection-service";
import { ConnectionButtons } from "@/features/connect/connection-buttons";
import { isMetaConfigured } from "@/lib/services/meta-oauth";
import type { Client, SupportedNetwork } from "@/lib/types";

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string }>;
}

export const metadata: Metadata = {
  title: "Secure Client Connection — LCI Social Desk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConnectPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { status: completionStatus } = await searchParams;
  const resolved = await resolveInviteToken(token);

  if (!resolved) {
    return (
      <Shell>
        <StatusCard
          tone="invalid"
          title="Invite link is not valid"
          message="This connection link could not be verified. It may have been mistyped, modified, or never issued. Ask the LCI Social Desk team for a fresh link."
        />
      </Shell>
    );
  }

  if (resolved.status === "expired") {
    return (
      <Shell client={getClient(resolved.invite.clientId)}>
        <StatusCard
          tone="expired"
          title="This invite has expired"
          message="For security, client connection invites expire after a short window. Reach out to your account manager and they can generate a fresh link."
        />
      </Shell>
    );
  }

  if (resolved.status === "revoked") {
    return (
      <Shell client={getClient(resolved.invite.clientId)}>
        <StatusCard
          tone="invalid"
          title="This invite has been revoked"
          message="The LCI Social Desk team revoked this link. Contact your account manager for a new one."
        />
      </Shell>
    );
  }

  // Used or valid — both can be shown; "used" still renders the connection
  // status read-out so the client can confirm what's connected.
  await markInviteOpened(resolved.invite.id);

  const client = getClient(resolved.invite.clientId);
  const connections = client
    ? await listConnectionsForClient(client.id)
    : [];
  const requestedNetworks = resolved.invite.allowedNetworks;

  const requestedConnected = requestedNetworks.every(
    (n) =>
      connections.find((c) => c.platform === n)?.status === "connected",
  );

  return (
    <Shell client={client}>
      <div className="space-y-4">
        <Badge variant="brand" className="gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Secure Client Connection
        </Badge>
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            {client ? `Connect ${client.name} to LCI Social Desk` : "Connect your accounts"}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            You&rsquo;re receiving this invite from the LCI Social Desk team so
            they can publish to your Facebook Page and Instagram Business
            account on your behalf. Access stays inside the agency&rsquo;s
            workspace and can be revoked any time.
          </p>
        </div>

        {completionStatus === "success" || resolved.status === "used" ? (
          <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-semibold">Connection received.</div>
              <div>
                You can safely close this tab. The LCI Social Desk team has
                been notified.
              </div>
            </div>
          </div>
        ) : null}

        {completionStatus === "error" ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-semibold">We didn&rsquo;t finish connecting.</div>
              <div>
                The connection attempt was cancelled or denied. You can try
                again below.
              </div>
            </div>
          </div>
        ) : null}

        {!isMetaConfigured() ? (
          <div className="rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-[12px] text-amber-900">
            <span className="font-semibold">Demo connection mode.</span>{" "}
            Meta provider credentials aren&rsquo;t configured for this
            deployment, so the &ldquo;Continue to Meta&rdquo; button will
            complete a simulated connection so the team can verify the flow
            end-to-end.
          </div>
        ) : null}

        <ConnectionButtons
          token={resolved.token}
          networks={requestedNetworks as SupportedNetwork[]}
          connections={connections.map((c) => ({
            platform: c.platform,
            status: c.status,
            accountName: c.accountName,
          }))}
          allConnected={requestedConnected}
        />

        <hr className="border-border" />

        <SupportBlock />
      </div>
    </Shell>
  );
}

function Shell({
  children,
  client,
}: {
  children: React.ReactNode;
  client?: Client;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))] md:border-b-0 md:border-r">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--brand))]/15 text-[hsl(var(--sidebar-accent))] ring-1 ring-[hsl(var(--brand))]/30">
              <span className="font-mono text-[11px] font-bold">LCI</span>
            </span>
            <div className="leading-tight">
              <div className="text-[12.5px] font-semibold tracking-tight text-white">
                LCI Social Desk
              </div>
              <div className="text-[10.5px] uppercase tracking-wider text-[hsl(var(--sidebar-muted))]">
                Agency Workspace
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[11.5px] text-[hsl(var(--sidebar-muted))]">
            <Pillar
              icon={<Lock className="h-3 w-3" />}
              title="Encrypted handoff"
              body="Authorization happens directly on Meta. We never see your password."
            />
            <Pillar
              icon={<ShieldCheck className="h-3 w-3" />}
              title="Scoped access"
              body="The agency only receives the permissions required to publish posts."
            />
            <Pillar
              icon={<TimerOff className="h-3 w-3" />}
              title="Revocable any time"
              body="Disconnect at meta.com or by asking the agency to revoke access."
            />
          </div>

          {client ? (
            <div className="mt-6 rounded-md border border-white/5 bg-white/5 p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-[hsl(var(--sidebar-muted))]">
                Issued for
              </div>
              <div className="mt-0.5 text-[12.5px] font-semibold tracking-tight text-white">
                {client.name}
              </div>
              <div className="text-[11px] text-[hsl(var(--sidebar-muted))]">
                {client.industry}
              </div>
            </div>
          ) : null}
        </aside>
        <section className="p-6 md:p-8">{children}</section>
      </div>
    </main>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--brand))]/15 text-[hsl(var(--sidebar-accent))]">
        {icon}
      </span>
      <div>
        <div className="text-[11.5px] font-semibold text-white">{title}</div>
        <div>{body}</div>
      </div>
    </div>
  );
}

function StatusCard({
  tone,
  title,
  message,
}: {
  tone: "expired" | "invalid";
  title: string;
  message: string;
}) {
  return (
    <Card
      className={
        tone === "expired"
          ? "border-amber-300 bg-amber-50"
          : "border-destructive/40 bg-destructive/5"
      }
    >
      <div className="flex items-start gap-3 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-foreground">
          {tone === "expired" ? (
            <TimerOff className="h-4 w-4 text-amber-700" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </span>
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-[12.5px] text-foreground/80">{message}</p>
        </div>
      </div>
    </Card>
  );
}

function SupportBlock() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@lci.agency";
  return (
    <div className="text-[11.5px] text-muted-foreground">
      Need help? Email{" "}
      <a
        href={`mailto:${supportEmail}`}
        className="font-medium text-[hsl(var(--brand))] hover:underline"
      >
        {supportEmail}
      </a>{" "}
      and the LCI Social Desk team will help you out. Do not share this link —
      it is unique to your business and can only be used once.
    </div>
  );
}
