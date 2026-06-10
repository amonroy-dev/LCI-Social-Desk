import { TopBar } from "@/components/shell/top-bar";
import { AnalyticsDashboard } from "@/features/analytics/analytics-dashboard";
import { loadClients } from "@/lib/services/client-service";

export default async function AnalyticsPage() {
  const allClients = await loadClients();
  const clients = allClients
    .filter((c) => !c.archivedAt)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <TopBar
        title="Profile Performance"
        subtitle="Track impressions, engagements, and audience growth across Facebook and Instagram."
      />
      <AnalyticsDashboard clients={clients} />
    </>
  );
}
