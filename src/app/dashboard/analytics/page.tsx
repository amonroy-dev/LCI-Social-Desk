import { TopBar } from "@/components/shell/top-bar";
import { AnalyticsDashboard } from "@/features/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <>
      <TopBar
        title="Profile Performance"
        subtitle="Track impressions, engagements, and audience growth across Facebook and Instagram."
      />
      <AnalyticsDashboard />
    </>
  );
}
