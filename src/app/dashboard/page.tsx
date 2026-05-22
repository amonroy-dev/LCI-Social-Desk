import Link from "next/link";

import { TopBar } from "@/components/shell/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardIndexPage() {
  return (
    <>
      <TopBar
        title="Workspace"
        subtitle="Operational overview of client accounts and active drafts."
      />
      <main className="flex-1 overflow-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Start a new draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Open the publishing console to compose, preview, and schedule a
                post for one of your client accounts.
              </p>
              <Button asChild variant="brand" size="sm">
                <Link href="/dashboard/publishing/new">Open publishing</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pinned client accounts</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Pin clients to keep them at the top of the publishing switcher.
              Coming in a later iteration.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Audit log surfaces saves, schedules, and publishes once Firestore
              is wired up.
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
