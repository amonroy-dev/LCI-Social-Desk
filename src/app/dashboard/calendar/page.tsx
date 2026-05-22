import { TopBar } from "@/components/shell/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <>
      <TopBar
        title="Calendar"
        subtitle="Cross-client schedule view. Coming in a later iteration."
      />
      <main className="flex-1 overflow-auto px-6 py-5">
        <Card>
          <CardHeader>
            <CardTitle>Schedule overview</CardTitle>
          </CardHeader>
          <CardContent className="text-[12px] text-muted-foreground">
            The full calendar surface — including week and month views with
            cross-client filtering — is part of the next milestone.
          </CardContent>
        </Card>
      </main>
    </>
  );
}
