import { TopBar } from "@/components/shell/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <>
      <TopBar
        title="Analytics"
        subtitle="Lightweight performance overview. Detailed analytics is a later milestone."
      />
      <main className="flex-1 overflow-auto px-6 py-5">
        <Card>
          <CardHeader>
            <CardTitle>Performance overview</CardTitle>
          </CardHeader>
          <CardContent className="text-[12px] text-muted-foreground">
            Engagement, reach, and impression rollups will appear here once
            provider analytics are connected.
          </CardContent>
        </Card>
      </main>
    </>
  );
}
