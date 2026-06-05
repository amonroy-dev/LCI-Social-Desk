"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Building2, Link2, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientChip } from "@/features/publishing/components/client-switcher";
import { AddClientDialog } from "@/features/clients/add-client-dialog";
import type { Client, SocialConnection } from "@/lib/types";

export interface ClientRosterRow {
  client: Client;
  connections: Array<Pick<SocialConnection, "platform" | "status">>;
}

interface ClientsRosterProps {
  rows: ClientRosterRow[];
}

export function ClientsRoster({ rows: initialRows }: ClientsRosterProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<ClientRosterRow[]>(initialRows);
  const [highlightId, setHighlightId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const onCreated = (client: Client) => {
    setRows((prev) =>
      [{ client, connections: [] }, ...prev].sort((a, b) =>
        a.client.name.localeCompare(b.client.name),
      ),
    );
    setHighlightId(client.id);
    // Ask the server to revalidate so subsequent navigations see the new
    // client too (composer switcher, approvals page, etc).
    router.refresh();
    setTimeout(() => setHighlightId(null), 2400);
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
            {rows.length} {rows.length === 1 ? "client" : "clients"}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Each card opens that client&rsquo;s connection management.
          </p>
        </div>
        <Button
          variant="brand"
          size="sm"
          onClick={() => setOpen(true)}
          className="self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add client
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState onAdd={() => setOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ client, connections }) => {
            const fb = connections.find((c) => c.platform === "facebook");
            const ig = connections.find((c) => c.platform === "instagram");
            const isNew = client.id === highlightId;
            return (
              <Card
                key={client.id}
                className={
                  isNew
                    ? "ring-2 ring-[hsl(var(--brand))]/40 transition-shadow"
                    : undefined
                }
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <ClientChip client={client} />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-1.5">
                        {client.name}
                        {isNew ? (
                          <Badge variant="brand">New</Badge>
                        ) : null}
                      </CardTitle>
                      <p className="text-[11.5px] text-muted-foreground">
                        {client.industry || "Industry not set"}
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
      )}

      <AddClientDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={onCreated}
      />
    </>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
        <Building2 className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
          No clients yet
        </h3>
        <p className="mt-0.5 max-w-md text-[12.5px] text-muted-foreground">
          Add your first client to start composing posts and managing their
          Facebook + Instagram connections.
        </p>
      </div>
      <Button variant="brand" size="sm" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />
        Add a client
      </Button>
    </div>
  );
}
