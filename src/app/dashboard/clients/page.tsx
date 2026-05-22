import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";

import { TopBar } from "@/components/shell/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientChip } from "@/features/publishing/components/client-switcher";
import { SAMPLE_CLIENTS } from "@/lib/sample-data";
import { listConnectionsForClient } from "@/lib/services/connection-service";

export default async function ClientsPage() {
  const rows = await Promise.all(
    SAMPLE_CLIENTS.map(async (client) => ({
      client,
      connections: await listConnectionsForClient(client.id),
    })),
  );

  return (
    <>
      <TopBar
        title="Clients"
        subtitle="Managed client accounts and their connection status."
      />
      <main className="flex-1 overflow-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ client, connections }) => {
            const fb = connections.find((c) => c.platform === "facebook");
            const ig = connections.find((c) => c.platform === "instagram");
            return (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <ClientChip client={client} />
                    <div className="min-w-0 flex-1">
                      <CardTitle>{client.name}</CardTitle>
                      <p className="text-[11.5px] text-muted-foreground">
                        {client.industry}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={
                        fb?.status === "connected" ? "success" : "outline"
                      }
                    >
                      Facebook · {fb?.status ?? "not connected"}
                    </Badge>
                    <Badge
                      variant={
                        ig?.status === "connected" ? "success" : "outline"
                      }
                    >
                      Instagram · {ig?.status ?? "not connected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/clients/${client.id}/connections`}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Manage connections
                      </Link>
                    </Button>
                    <Link
                      href={`/dashboard/clients/${client.id}/connections`}
                      className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"
                    >
                      Open
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
