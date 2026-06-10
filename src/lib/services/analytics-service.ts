import "server-only";

import { connectionRepository } from "@/lib/repositories/connection-repository";
import type { AnalyticsResponse, DayPoint, PerPlatformTotals } from "@/features/analytics/types";

const GRAPH = "https://graph.facebook.com/v19.0";

// Meta Graph API response shapes
interface MetaInsightValue {
  value: number;
  end_time: string;
}

interface MetaInsightMetric {
  name: string;
  period: string;
  values: MetaInsightValue[];
}

interface MetaInsightsResponse {
  data?: MetaInsightMetric[];
  error?: { code: number; message: string; fbtrace_id?: string };
}

// end_time marks the END of the day period; subtract 1 day to get the actual date
function parseInsightValues(values: MetaInsightValue[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of values) {
    const d = new Date(v.end_time);
    d.setUTCDate(d.getUTCDate() - 1);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    map.set(key, typeof v.value === "number" ? v.value : 0);
  }
  return map;
}

type MetricMap = Map<string, Map<string, number>>;

async function fetchFBInsights(
  pageId: string,
  accessToken: string,
  metrics: string[],
  since: number,
  until: number,
): Promise<MetricMap> {
  try {
    const params = new URLSearchParams({
      metric: metrics.join(","),
      period: "day",
      since: String(since),
      until: String(until),
      access_token: accessToken,
    });
    const res = await fetch(`${GRAPH}/${pageId}/insights?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return new Map();
    const json = (await res.json()) as MetaInsightsResponse;
    if (json.error || !json.data) {
      console.warn(`[analytics] FB insights error for page ${pageId}: ${json.error?.message}`);
      return new Map();
    }
    const result: MetricMap = new Map();
    for (const metric of json.data) {
      result.set(metric.name, parseInsightValues(metric.values));
    }
    return result;
  } catch (err) {
    console.warn("[analytics] FB fetch error:", err);
    return new Map();
  }
}

// Instagram enforces a 30-day window for period=day; split into 27-day chunks
async function fetchIGInsights(
  igUserId: string,
  accessToken: string,
  metrics: string[],
  sinceUnix: number,
  untilUnix: number,
): Promise<MetricMap> {
  const result: MetricMap = new Map();
  const CHUNK_SECS = 27 * 24 * 60 * 60;

  let chunkStart = sinceUnix;
  while (chunkStart < untilUnix) {
    const chunkEnd = Math.min(chunkStart + CHUNK_SECS, untilUnix);
    try {
      const params = new URLSearchParams({
        metric: metrics.join(","),
        period: "day",
        since: String(chunkStart),
        until: String(chunkEnd),
        access_token: accessToken,
      });
      const res = await fetch(`${GRAPH}/${igUserId}/insights?${params}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as MetaInsightsResponse;
        if (json.data) {
          for (const metric of json.data) {
            if (!result.has(metric.name)) result.set(metric.name, new Map());
            const existing = result.get(metric.name)!;
            for (const [k, v] of parseInsightValues(metric.values)) {
              existing.set(k, v);
            }
          }
        } else if (json.error) {
          console.warn(`[analytics] IG insights error for ${igUserId}: ${json.error.message}`);
        }
      }
    } catch (err) {
      console.warn("[analytics] IG fetch chunk error:", err);
    }
    chunkStart = chunkEnd;
  }
  return result;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate(); // month 1-12
}

function buildDayPoints(
  year: number,
  month: number,
  fbMap: Map<string, number>,
  igMap: Map<string, number>,
): DayPoint[] {
  const days = daysInMonth(year, month);
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    facebook: fbMap.get(dateKey(year, month, i + 1)) ?? 0,
    instagram: igMap.get(dateKey(year, month, i + 1)) ?? 0,
  }));
}

function sum(points: DayPoint[], field: "facebook" | "instagram"): number {
  return points.reduce((acc, p) => acc + p[field], 0);
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return 0;
  return parseFloat(((curr - prev) / Math.abs(prev)) * 100 + "");
}

function roundChange(n: number): number {
  return parseFloat(n.toFixed(1));
}

function computeTotals(curr: DayPoint[], prev: DayPoint[]): PerPlatformTotals {
  const currFb = sum(curr, "facebook");
  const currIg = sum(curr, "instagram");
  const prevFb = sum(prev, "facebook");
  const prevIg = sum(prev, "instagram");
  return {
    facebook: currFb,
    instagram: currIg,
    total: currFb + currIg,
    facebookChange: roundChange(pctChange(currFb, prevFb)),
    instagramChange: roundChange(pctChange(currIg, prevIg)),
    totalChange: roundChange(pctChange(currFb + currIg, prevFb + prevIg)),
  };
}

const EMPTY_MAP = new Map<string, number>();
const EMPTY_METRIC_MAP: MetricMap = new Map();

export async function fetchMetaAnalytics(
  clientId: string,
  year: number,
  month: number, // 1-12
): Promise<AnalyticsResponse | null> {
  const [fbConn, igConn] = await Promise.all([
    connectionRepository.get(clientId, "facebook"),
    connectionRepository.get(clientId, "instagram"),
  ]);

  const fbConnected =
    fbConn?.status === "connected" && !!fbConn.accessToken && !!fbConn.accountId;
  const igConnected =
    igConn?.status === "connected" && !!igConn.accessToken && !!igConn.accountId;

  if (!fbConnected && !igConnected) return null;

  const isSimulated =
    (fbConn?.note?.includes("simulated") === true) ||
    (igConn?.note?.includes("simulated") === true);

  // Date ranges — Unix timestamps (seconds)
  const currStart = Math.floor(Date.UTC(year, month - 1, 1) / 1000);
  const currEnd = Math.floor(Date.UTC(year, month, 1) / 1000);
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevStart = Math.floor(Date.UTC(prevYear, prevMonth - 1, 1) / 1000);
  const prevEnd = currStart;

  // FB: impressions, engaged users, net new fans, video views
  const FB_METRICS = ["page_impressions", "page_engaged_users", "page_fan_adds_unique", "page_video_views"];
  // IG: impressions, reach (engagement proxy), daily follower count change
  const IG_METRICS = ["impressions", "reach", "follower_count"];

  const [currFb, prevFb, currIg, prevIg] = await Promise.all([
    fbConnected
      ? fetchFBInsights(fbConn!.accountId!, fbConn!.accessToken!, FB_METRICS, currStart, currEnd)
      : Promise.resolve(EMPTY_METRIC_MAP),
    fbConnected
      ? fetchFBInsights(fbConn!.accountId!, fbConn!.accessToken!, FB_METRICS, prevStart, prevEnd)
      : Promise.resolve(EMPTY_METRIC_MAP),
    igConnected
      ? fetchIGInsights(igConn!.accountId!, igConn!.accessToken!, IG_METRICS, currStart, currEnd)
      : Promise.resolve(EMPTY_METRIC_MAP),
    igConnected
      ? fetchIGInsights(igConn!.accountId!, igConn!.accessToken!, IG_METRICS, prevStart, prevEnd)
      : Promise.resolve(EMPTY_METRIC_MAP),
  ]);

  // Build day-by-day arrays
  const currImpressions = buildDayPoints(
    year, month,
    currFb.get("page_impressions") ?? EMPTY_MAP,
    currIg.get("impressions") ?? EMPTY_MAP,
  );
  const prevImpressions = buildDayPoints(
    prevYear, prevMonth,
    prevFb.get("page_impressions") ?? EMPTY_MAP,
    prevIg.get("impressions") ?? EMPTY_MAP,
  );

  const currEngagements = buildDayPoints(
    year, month,
    currFb.get("page_engaged_users") ?? EMPTY_MAP,
    currIg.get("reach") ?? EMPTY_MAP,
  );
  const prevEngagements = buildDayPoints(
    prevYear, prevMonth,
    prevFb.get("page_engaged_users") ?? EMPTY_MAP,
    prevIg.get("reach") ?? EMPTY_MAP,
  );

  const currAudienceGrowth = buildDayPoints(
    year, month,
    currFb.get("page_fan_adds_unique") ?? EMPTY_MAP,
    currIg.get("follower_count") ?? EMPTY_MAP,
  );
  const prevAudienceGrowth = buildDayPoints(
    prevYear, prevMonth,
    prevFb.get("page_fan_adds_unique") ?? EMPTY_MAP,
    prevIg.get("follower_count") ?? EMPTY_MAP,
  );

  // Video views: FB only (IG account-level video views not available in basic insights API)
  const currVideoViews = buildDayPoints(
    year, month,
    currFb.get("page_video_views") ?? EMPTY_MAP,
    EMPTY_MAP,
  );
  const prevVideoViews = buildDayPoints(
    prevYear, prevMonth,
    prevFb.get("page_video_views") ?? EMPTY_MAP,
    EMPTY_MAP,
  );

  // Engagement rate: engagements / impressions * 100
  const currEngRate: DayPoint[] = currImpressions.map((imp, i) => ({
    day: i + 1,
    facebook:
      imp.facebook > 0
        ? parseFloat((currEngagements[i].facebook / imp.facebook * 100).toFixed(2))
        : 0,
    instagram:
      imp.instagram > 0
        ? parseFloat((currEngagements[i].instagram / imp.instagram * 100).toFixed(2))
        : 0,
  }));

  const prevEngRate: DayPoint[] = prevImpressions.map((imp, i) => ({
    day: i + 1,
    facebook:
      imp.facebook > 0
        ? parseFloat((prevEngagements[i].facebook / imp.facebook * 100).toFixed(2))
        : 0,
    instagram:
      imp.instagram > 0
        ? parseFloat((prevEngagements[i].instagram / imp.instagram * 100).toFixed(2))
        : 0,
  }));

  // Aggregate totals
  const impressionTotals = computeTotals(currImpressions, prevImpressions);
  const engagementTotals = computeTotals(currEngagements, prevEngagements);
  const audienceGrowthTotals = computeTotals(currAudienceGrowth, prevAudienceGrowth);
  const videoViewTotals = computeTotals(currVideoViews, prevVideoViews);

  const currEngRateFb =
    impressionTotals.facebook > 0
      ? parseFloat((engagementTotals.facebook / impressionTotals.facebook * 100).toFixed(1))
      : 0;
  const currEngRateIg =
    impressionTotals.instagram > 0
      ? parseFloat((engagementTotals.instagram / impressionTotals.instagram * 100).toFixed(1))
      : 0;
  const currEngRateTotal =
    impressionTotals.total > 0
      ? parseFloat((engagementTotals.total / impressionTotals.total * 100).toFixed(1))
      : 0;

  const prevFbImp = sum(prevImpressions, "facebook");
  const prevIgImp = sum(prevImpressions, "instagram");
  const prevFbEng = sum(prevEngagements, "facebook");
  const prevIgEng = sum(prevEngagements, "instagram");
  const prevEngRateFb = prevFbImp > 0 ? parseFloat((prevFbEng / prevFbImp * 100).toFixed(1)) : 0;
  const prevEngRateIg = prevIgImp > 0 ? parseFloat((prevIgEng / prevIgImp * 100).toFixed(1)) : 0;
  const prevEngRateTotal =
    prevFbImp + prevIgImp > 0
      ? parseFloat(((prevFbEng + prevIgEng) / (prevFbImp + prevIgImp) * 100).toFixed(1))
      : 0;

  return {
    impressions: currImpressions,
    engagements: currEngagements,
    audienceGrowth: currAudienceGrowth,
    engagementRate: currEngRate,
    videoViews: currVideoViews,
    totals: {
      impressions: impressionTotals,
      engagements: engagementTotals,
      audienceGrowth: audienceGrowthTotals,
      engagementRate: {
        facebook: currEngRateFb,
        instagram: currEngRateIg,
        total: currEngRateTotal,
        facebookChange: roundChange(pctChange(currEngRateFb, prevEngRateFb)),
        instagramChange: roundChange(pctChange(currEngRateIg, prevEngRateIg)),
        totalChange: roundChange(pctChange(currEngRateTotal, prevEngRateTotal)),
      },
      videoViews: videoViewTotals,
      postLinkClicks: { total: 0, totalChange: 0 },
    },
    fbConnected,
    igConnected,
    isSimulated,
  };
}
