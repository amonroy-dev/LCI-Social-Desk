import { TopBar } from "@/components/shell/top-bar";
import { ClientsRoster, type ClientRosterRow } from "@/features/clients/clients-roster";
import { loadClients } from "@/lib/services/client-service";
import { listConnectionsForClient } from "@/lib/services/connection-service";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await loadClients();
  const rows: ClientRosterRow[] = await Promise.all(
    clients.map(async (client) => ({
      client,
      connections: (await listConnectionsForClient(client.id)).map((c) => ({
        platform: c.platform,
        status: c.status,
      })),
    })),
  );

  return (
    <>
      <TopBar
        title="Clients"
        subtitle="Managed client accounts and their connection status."
      />
      <main className="flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-5">
        <ClientsRoster rows={rows} />
      </main>
    </>
  );
}
