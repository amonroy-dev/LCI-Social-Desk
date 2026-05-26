import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { TopBar } from "@/components/shell/top-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientChip } from "@/features/publishing/components/client-switcher";
import { ConnectionsView } from "@/features/connections/connections-view";
import { InviteGenerator } from "@/features/connections/invite-generator";
import { requireSession } from "@/lib/auth/server";
import { loadClient } from "@/lib/services/client-service";
import { createInvite, getAppBaseUrl } from "@/lib/services/invite-service";
import { listConnectionsForClient } from "@/lib/services/connection-service";
import { isMetaConfigured } from "@/lib/services/meta-oauth";
import { isEmailConfigured } from "@/lib/services/email-service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientConnectionsPage({ params }: PageProps) {
  const session = await requireSession();
  const { clientId } = await params;
  const client = await loadClient(clientId);
  if (!client) notFound();

  const connections = await listConnectionsForClient(client.id);

  // Pre-mint an agency-initiated invite token so the Reconnect button on the
  // status cards can deep-link straight into the Meta OAuth handoff. This
  // doesn't surface the link to a client — it stays inside the dashboard.
  const reconnect = await createInvite(
    {
      clientId: client.id,
      allowedNetworks: ["facebook", "instagram"],
      ttlMs: 60 * 60 * 1000,
    },
    session,
  );

  const reconnectUrl = `/api/oauth/meta/start?token=${encodeURIComponent(reconnect.token)}`;
  const baseUrl = getAppBaseUrl();

  return (
    <>
      <TopBar
        title="Client connections"
        subtitle="Manage Facebook and Instagram access for this client account."
      />
      <main className="flex-1 overflow-auto px-6 py-5">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ClientChip client={client} />
              <div>
                <div className="text-[15px] font-semibold tracking-tight">
                  {client.name}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {client.industry} · Client account
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All clients
            </Link>
          </div>

          {!isMetaConfigured() ? (
            <div className="rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-[12px] text-amber-900">
              <span className="font-semibold">Meta credentials not configured.</span>{" "}
              The connect flow will complete a clearly-labeled simulated
              connection. Set <code className="font-mono">META_APP_ID</code> and{" "}
              <code className="font-mono">META_APP_SECRET</code> to enable the
              real Facebook + Instagram OAuth handoff.
            </div>
          ) : null}

          <ConnectionsView
            clientId={client.id}
            clientName={client.name}
            connections={connections}
            reconnectUrl={reconnectUrl}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--brand))]" />
                  Issue a secure connection invite
                </CardTitle>
                <Badge variant="outline">
                  Base URL · {baseUrl.replace(/^https?:\/\//, "")}
                </Badge>
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                Generate a token-protected link to send the client. Opening the
                link does not require an LCI Social Desk account.
              </p>
            </CardHeader>
            <CardContent>
              <InviteGenerator clientId={client.id} clientName={client.name} emailConfigured={isEmailConfigured()} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[12px] text-muted-foreground">
              <p>
                Posts can only be sent to a network once its connection is in
                the <span className="font-medium text-foreground">connected</span>{" "}
                state and the required publishing scope has been granted.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Facebook needs{" "}
                  <code className="font-mono text-[11px]">pages_manage_posts</code>.
                </li>
                <li>
                  Instagram needs{" "}
                  <code className="font-mono text-[11px]">instagram_content_publish</code>.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
