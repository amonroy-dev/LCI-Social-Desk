import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { TopBar } from "@/components/shell/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublishingWorkspace } from "@/features/publishing/publishing-workspace";
import { loadClients } from "@/lib/services/client-service";
import { isEmailConfigured } from "@/lib/services/email-service";

export const metadata = {
  title: "New Draft — LCI Social Desk",
};

export const dynamic = "force-dynamic";

export default async function NewDraftPage() {
  const clients = await loadClients();

  if (clients.length === 0) {
    return (
      <>
        <TopBar
          title="New Draft"
          subtitle="Add your first client before composing posts."
        />
        <main className="flex-1 overflow-auto px-6 py-10">
          <Card className="mx-auto flex max-w-lg flex-col items-center gap-3 p-8 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
              <Building2 className="h-4 w-4" />
            </span>
            <h2 className="text-[16px] font-semibold tracking-tight">
              Add a client to start composing
            </h2>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Drafts, scheduled posts, and review links are all scoped to a
              client. Add one to unlock the composer.
            </p>
            <Button asChild variant="brand" size="sm">
              <Link href="/dashboard/clients">
                <ArrowRight className="h-3.5 w-3.5" />
                Open Clients
              </Link>
            </Button>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="New Draft"
        subtitle="Draft mode is on. Posts will not publish until scheduled or posted."
      />
      <PublishingWorkspace
        clients={clients}
        emailConfigured={isEmailConfigured()}
      />
    </>
  );
}
