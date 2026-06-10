import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/server";
import { fetchMetaAnalytics } from "@/lib/services/analytics-service";
import { ReportDocument } from "@/features/analytics/report-document";
import {
  DEMO_AUDIENCE_GROWTH,
  DEMO_ENGAGEMENT_RATE,
  DEMO_ENGAGEMENTS,
  DEMO_IMPRESSIONS,
  DEMO_TOTALS,
  DEMO_VIDEO_VIEWS,
} from "@/features/analytics/demo-data";
import type { AnalyticsResponse } from "@/features/analytics/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics Report — LCI Social Desk",
};

interface PageProps {
  searchParams: Promise<{
    clientId?: string;
    year?: string;
    month?: string;
    demo?: string;
    clientName?: string;
  }>;
}

function resolveDemoData(): AnalyticsResponse {
  const d = DEMO_TOTALS;
  return {
    impressions: DEMO_IMPRESSIONS,
    engagements: DEMO_ENGAGEMENTS,
    audienceGrowth: DEMO_AUDIENCE_GROWTH,
    engagementRate: DEMO_ENGAGEMENT_RATE,
    videoViews: DEMO_VIDEO_VIEWS,
    totals: {
      impressions: {
        facebook: d.impressions.facebook,
        instagram: d.impressions.instagram,
        total: d.impressions.total,
        facebookChange: d.impressions.facebookChange,
        instagramChange: d.impressions.instagramChange,
        totalChange: d.impressions.totalChange,
      },
      engagements: {
        facebook: d.engagements.facebook,
        instagram: d.engagements.instagram,
        total: d.engagements.total,
        facebookChange: d.engagements.facebookChange,
        instagramChange: d.engagements.instagramChange,
        totalChange: d.engagements.totalChange,
      },
      audienceGrowth: {
        facebook: d.audienceGrowth.facebook,
        instagram: d.audienceGrowth.instagram,
        total: d.audienceGrowth.total,
        facebookChange: d.audienceGrowth.facebookChange,
        instagramChange: d.audienceGrowth.instagramChange,
        totalChange: d.audienceGrowth.totalChange,
      },
      engagementRate: {
        facebook: d.engagementRate.facebook,
        instagram: d.engagementRate.instagram,
        total: d.engagementRate.total,
        facebookChange: d.engagementRate.facebookChange,
        instagramChange: d.engagementRate.instagramChange,
        totalChange: d.engagementRate.totalChange,
      },
      videoViews: {
        facebook: d.videoViews.facebook,
        instagram: d.videoViews.instagram,
        total: d.videoViews.total,
        facebookChange: d.videoViews.facebookChange,
        instagramChange: d.videoViews.instagramChange,
        totalChange: d.videoViews.totalChange,
      },
      postLinkClicks: {
        total: d.postLinkClicks.total,
        totalChange: d.postLinkClicks.totalChange,
      },
    },
    fbConnected: true,
    igConnected: true,
    isSimulated: false,
  };
}

export default async function ReportPage({ searchParams }: PageProps) {
  await requireSession();

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth() + 1), 10);
  const isDemo = params.demo === "true";
  const clientName = decodeURIComponent(params.clientName ?? "Client");

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    redirect("/dashboard/analytics");
  }

  let data: AnalyticsResponse;

  if (isDemo) {
    data = resolveDemoData();
  } else {
    if (!params.clientId) redirect("/dashboard/analytics");
    const fetched = await fetchMetaAnalytics(params.clientId!, year, month);
    if (!fetched) redirect("/dashboard/analytics");
    data = fetched;
  }

  return (
    <ReportDocument
      data={data}
      year={year}
      month={month}
      clientName={clientName}
      isDemo={isDemo}
    />
  );
}
