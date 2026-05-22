import { TopBar } from "@/components/shell/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <TopBar
        title="Settings"
        subtitle="Workspace, member, and connection settings."
      />
      <main className="flex-1 overflow-auto px-6 py-5">
        <Card>
          <CardHeader>
            <CardTitle>Workspace settings</CardTitle>
          </CardHeader>
          <CardContent className="text-[12px] text-muted-foreground">
            Member management, social connections, and audit log retention
            settings will live here.
          </CardContent>
        </Card>
      </main>
    </>
  );
}
