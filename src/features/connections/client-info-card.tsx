"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, Mail, Pencil, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditClientDialog } from "@/features/clients/edit-client-dialog";
import type { Client } from "@/lib/types";

interface ClientInfoCardProps {
  client: Client;
}

export function ClientInfoCard({ client: initialClient }: ClientInfoCardProps) {
  const router = useRouter();
  const [client, setClient] = React.useState(initialClient);
  const [editOpen, setEditOpen] = React.useState(false);

  const onUpdated = (updated: Client) => {
    setClient(updated);
    router.refresh();
  };

  const hasContact = !!(client.primaryContactName || client.primaryContactEmail);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[13px]">Client details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[11.5px] text-muted-foreground"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasContact || client.website ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {client.primaryContactName ? (
                <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Contact name" value={client.primaryContactName} />
              ) : null}
              {client.primaryContactEmail ? (
                <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Contact email" value={client.primaryContactEmail} />
              ) : null}
              {client.website ? (
                <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Website" value={client.website} />
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Add primary contact info — used to pre-fill approval and invite forms
            </button>
          )}
        </CardContent>
      </Card>

      <EditClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onUpdated={onUpdated}
      />
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-[12.5px] text-foreground">{value}</p>
      </div>
    </div>
  );
}
