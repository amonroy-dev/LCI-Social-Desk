import { TopBar } from "@/components/shell/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientChip } from "@/features/publishing/components/client-switcher";
import { SAMPLE_CLIENTS } from "@/lib/sample-data";

export default function ClientsPage() {
  return (
    <>
      <TopBar
        title="Clients"
        subtitle="Managed client accounts for this agency workspace."
      />
      <main className="flex-1 overflow-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SAMPLE_CLIENTS.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ClientChip client={client} />
                  <div>
                    <CardTitle>{client.name}</CardTitle>
                    <p className="text-[11.5px] text-muted-foreground">
                      {client.industry}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-[12px] text-muted-foreground">
                Connections, social accounts, and media library entries appear
                here once Firestore is wired in.
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
