"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart2,
  ChevronDown,
  FileDown,
  Loader2,
  Unplug,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DEMO_AUDIENCE_GROWTH,
  DEMO_ENGAGEMENT_RATE,
  DEMO_ENGAGEMENTS,
  DEMO_IMPRESSIONS,
  DEMO_TOTALS,
  DEMO_VIDEO_VIEWS,
  type DayPoint,
} from "./demo-data";
import type { AnalyticsResponse, AnalyticsTotals } from "./types";

const FB_COLOR = "#1877F2";
const IG_COLOR = "#E1306C";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function fmtFull(n: number): string {
  return n.toLocaleString();
}

function TrendBadge({ change, suffix = "%" }: { change: number; suffix?: string }) {
  const pos = change >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[12px] font-semibold",
        pos ? "text-emerald-600" : "text-red-500",
      )}
    >
      {pos ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(change)}{suffix}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  change: number;
}
function KpiCard({ label, value, change }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1 border-r border-border/60 px-3 py-3 last:border-r-0 sm:px-6 sm:py-4">
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-[17px] font-bold tracking-tight text-foreground sm:text-[22px]">{value}</span>
        <TrendBadge change={change} />
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
  isRate = false,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
  isRate?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg text-[12px]">
      <p className="mb-1.5 font-semibold text-foreground">Day {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">
            {isRate ? `${p.value}%` : fmtFull(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

interface MetricSectionProps {
  title: string;
  description: string;
  data: DayPoint[];
  chartType: "area" | "line";
  isRate?: boolean;
  tableRows: Array<{
    label: string;
    value: string | number;
    change: number;
    isSummary?: boolean;
  }>;
}

function MetricSection({
  title,
  description,
  data,
  chartType,
  isRate = false,
  tableRows,
}: MetricSectionProps) {
  const chartData = data.map((d) => ({
    day: d.day,
    facebook: d.facebook,
    instagram: d.instagram,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[15px] font-semibold">{title}</CardTitle>
        <p className="text-[12px] text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[160px] w-full sm:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-fb-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={FB_COLOR} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={FB_COLOR} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id={`grad-ig-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={IG_COLOR} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={IG_COLOR} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (isRate ? `${v}%` : fmt(v))}
                  width={40}
                />
                <Tooltip content={<CustomTooltip isRate={isRate} />} />
                <Area
                  type="monotone"
                  dataKey="facebook"
                  name="facebook"
                  stroke={FB_COLOR}
                  fill={`url(#grad-fb-${title})`}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="instagram"
                  name="instagram"
                  stroke={IG_COLOR}
                  fill={`url(#grad-ig-${title})`}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (isRate ? `${v}%` : fmt(v))}
                  width={40}
                />
                <Tooltip content={<CustomTooltip isRate={isRate} />} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                <Line
                  type="monotone"
                  dataKey="facebook"
                  name="facebook"
                  stroke={FB_COLOR}
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="instagram"
                  name="instagram"
                  stroke={IG_COLOR}
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: FB_COLOR }} />
            <span className="text-[11.5px] text-muted-foreground">Facebook</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: IG_COLOR }} />
            <span className="text-[11.5px] text-muted-foreground">Instagram</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60">
                <th className="py-2 text-left font-medium text-muted-foreground">
                  {title} Metrics
                </th>
                <th className="py-2 text-right font-medium text-muted-foreground">Totals</th>
                <th className="py-2 text-right font-medium text-muted-foreground">% Change</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-border/40 last:border-0",
                    row.isSummary && "font-semibold",
                  )}
                >
                  <td className="py-2 text-left text-foreground">{row.label}</td>
                  <td className="py-2 text-right text-foreground tabular-nums">
                    {typeof row.value === "number" ? fmtFull(row.value) : row.value}
                  </td>
                  <td className="py-2 text-right">
                    <TrendBadge change={row.change} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface ClientOption {
  id: string;
  name: string;
}

interface AnalyticsDashboardProps {
  clients: ClientOption[];
}

function resolveTotals(t: AnalyticsTotals | typeof DEMO_TOTALS): AnalyticsTotals {
  return {
    impressions: {
      facebook: t.impressions.facebook,
      instagram: t.impressions.instagram,
      total: t.impressions.total,
      facebookChange: t.impressions.facebookChange,
      instagramChange: t.impressions.instagramChange,
      totalChange: t.impressions.totalChange,
    },
    engagements: {
      facebook: t.engagements.facebook,
      instagram: t.engagements.instagram,
      total: t.engagements.total,
      facebookChange: t.engagements.facebookChange,
      instagramChange: t.engagements.instagramChange,
      totalChange: t.engagements.totalChange,
    },
    audienceGrowth: {
      facebook: t.audienceGrowth.facebook,
      instagram: t.audienceGrowth.instagram,
      total: t.audienceGrowth.total,
      facebookChange: t.audienceGrowth.facebookChange,
      instagramChange: t.audienceGrowth.instagramChange,
      totalChange: t.audienceGrowth.totalChange,
    },
    engagementRate: {
      facebook: t.engagementRate.facebook,
      instagram: t.engagementRate.instagram,
      total: t.engagementRate.total,
      facebookChange: t.engagementRate.facebookChange,
      instagramChange: t.engagementRate.instagramChange,
      totalChange: t.engagementRate.totalChange,
    },
    videoViews: {
      facebook: t.videoViews.facebook,
      instagram: t.videoViews.instagram,
      total: t.videoViews.total,
      facebookChange: t.videoViews.facebookChange,
      instagramChange: t.videoViews.instagramChange,
      totalChange: t.videoViews.totalChange,
    },
    postLinkClicks: {
      total: t.postLinkClicks.total,
      totalChange: t.postLinkClicks.totalChange,
    },
  };
}

export function AnalyticsDashboard({ clients }: AnalyticsDashboardProps) {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth()); // 0-based
  const [demoMode, setDemoMode] = React.useState(false);
  const [demoBannerOpen, setDemoBannerOpen] = React.useState(true);
  const [selectedClientId, setSelectedClientId] = React.useState<string>(
    clients[0]?.id ?? "",
  );

  const [realData, setRealData] = React.useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const prevMonthLabel =
    month === 0 ? `${MONTHS[11]} ${year - 1}` : `${MONTHS[month - 1]} ${year}`;

  React.useEffect(() => {
    if (demoMode || !selectedClientId) {
      setRealData(null);
      setFetchError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetch(
      `/api/analytics?clientId=${encodeURIComponent(selectedClientId)}&year=${year}&month=${month + 1}`,
    )
      .then((r) => r.json())
      .then((data: AnalyticsResponse) => {
        if (cancelled) return;
        if (data.error) {
          setFetchError(data.error);
          setRealData(null);
        } else {
          setRealData(data);
          setFetchError(null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError("Could not load analytics. Check your connection and try again.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [demoMode, selectedClientId, year, month]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Only show chart data when demo is on or real data has loaded
  const showData = demoMode || realData !== null;

  const t = showData
    ? resolveTotals(demoMode ? DEMO_TOTALS : realData!.totals)
    : null;

  const impressions = demoMode ? DEMO_IMPRESSIONS : (realData?.impressions ?? []);
  const engagements = demoMode ? DEMO_ENGAGEMENTS : (realData?.engagements ?? []);
  const audienceGrowth = demoMode ? DEMO_AUDIENCE_GROWTH : (realData?.audienceGrowth ?? []);
  const engagementRate = demoMode ? DEMO_ENGAGEMENT_RATE : (realData?.engagementRate ?? []);
  const videoViews = demoMode ? DEMO_VIDEO_VIEWS : (realData?.videoViews ?? []);

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      {/* ── Toolbar ── */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm px-3 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* LEFT: month nav + client selector */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2.5"
              onClick={prevMonth}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[140px] text-center text-[13px] font-semibold text-foreground">
              {MONTHS[month]} {year}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2.5"
              onClick={nextMonth}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <span className="ml-1 text-[11.5px] text-muted-foreground hidden sm:inline">
              vs {prevMonthLabel}
            </span>

            {/* Client selector — lives here so toggle position stays stable */}
            {!demoMode && clients.length > 0 && (
              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="h-8 appearance-none rounded-md border border-border bg-background pl-3 pr-8 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* RIGHT: report button + demo toggle */}
          <div className="flex items-center gap-3">
            {showData && (
              <a
                href={
                  demoMode
                    ? `/report/analytics?demo=true&year=${year}&month=${month + 1}&clientName=Demo`
                    : `/report/analytics?clientId=${encodeURIComponent(selectedClientId)}&year=${year}&month=${month + 1}&clientName=${encodeURIComponent(selectedClient?.name ?? "Client")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[12.5px] font-medium text-foreground hover:bg-muted/50"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download Report</span>
              </a>
            )}
            <span className="text-[12px] text-muted-foreground">Demo mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={demoMode}
              onClick={() => setDemoMode((v) => !v)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                demoMode ? "bg-[hsl(var(--brand))]" : "bg-input",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
                  demoMode ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 space-y-4 sm:px-6 sm:py-5 sm:space-y-5">
        {/* Demo mode banner */}
        {demoMode && demoBannerOpen && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-[hsl(var(--brand))]/20 bg-[hsl(var(--brand-soft))] px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--brand))]">
                Report Demo Mode
              </p>
              <p className="mt-0.5 text-[12px] text-[hsl(var(--brand))]/80">
                These are sample analytics to show what this report looks like fully rendered.
                Connect a client&apos;s Facebook or Instagram to see real data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDemoBannerOpen(false)}
              className="shrink-0 text-[hsl(var(--brand))]/60 hover:text-[hsl(var(--brand))]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Simulated token warning */}
        {!demoMode && realData?.isSimulated && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">Simulated Connection</p>
              <p className="mt-0.5 text-[12px] text-amber-700">
                This client connected via simulated OAuth (Meta credentials not configured).
                Real analytics require a live Meta App ID and Secret.
              </p>
            </div>
          </div>
        )}

        {/* No connections message */}
        {!demoMode && !loading && fetchError?.includes("No connected accounts") && (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Unplug className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">No connected accounts</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {selectedClient?.name ?? "This client"} hasn&apos;t connected Facebook or Instagram
                yet. Send them an invite link from the Clients page.
              </p>
            </div>
          </div>
        )}

        {/* Generic error message */}
        {!demoMode &&
          fetchError &&
          !fetchError.includes("No connected accounts") &&
          !loading && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-[13px] text-red-700">{fetchError}</p>
            </div>
          )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading analytics for {selectedClient?.name ?? "client"}…
          </div>
        )}

        {/* Empty state — demo off, no data, not loading */}
        {!demoMode && !loading && !fetchError && !realData && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BarChart2 className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-foreground">No analytics yet</p>
              <p className="max-w-xs text-[12px] text-muted-foreground">
                {clients.length === 0
                  ? "Add a client and connect their Facebook or Instagram account to see analytics here."
                  : "Select a client with a connected Facebook or Instagram account, or turn on Demo Mode to preview sample data."}
              </p>
            </div>
          </div>
        )}

        {/* ── Data sections — only rendered when demo is on or real data loaded ── */}
        {showData && t !== null && (
          <>
            {/* Performance Summary */}
            <Card className={cn(loading && "opacity-60 pointer-events-none")}>
              <CardHeader className="pb-1">
                <CardTitle className="text-[15px] font-semibold">Performance Summary</CardTitle>
                <p className="text-[12px] text-muted-foreground">
                  View your key profile performance metrics accrued during the selected time period.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60 lg:grid-cols-4">
                  <KpiCard
                    label="Impressions"
                    value={fmt(t.impressions.total)}
                    change={t.impressions.totalChange}
                  />
                  <KpiCard
                    label="Engagements"
                    value={fmt(t.engagements.total)}
                    change={t.engagements.totalChange}
                  />
                  <KpiCard
                    label="Net Audience Growth"
                    value={fmtFull(t.audienceGrowth.total)}
                    change={t.audienceGrowth.totalChange}
                  />
                  <KpiCard
                    label="Engagement Rate (per Impression)"
                    value={`${t.engagementRate.total}%`}
                    change={t.engagementRate.totalChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audience Growth */}
            <div className={cn(loading && "opacity-60 pointer-events-none")}>
              <MetricSection
                title="Audience Growth"
                description="See how your audience grew during the selected time period."
                data={audienceGrowth}
                chartType="line"
                tableRows={[
                  {
                    label: "Net Audience Growth",
                    value: t.audienceGrowth.total,
                    change: t.audienceGrowth.totalChange,
                    isSummary: true,
                  },
                  {
                    label: "Facebook Net Follower Growth",
                    value: t.audienceGrowth.facebook,
                    change: t.audienceGrowth.facebookChange,
                  },
                  {
                    label: "Instagram Net Follower Growth",
                    value: t.audienceGrowth.instagram,
                    change: t.audienceGrowth.instagramChange,
                  },
                ]}
              />
            </div>

            {/* Impressions */}
            <div className={cn(loading && "opacity-60 pointer-events-none")}>
              <MetricSection
                title="Impressions"
                description="Review how your content was seen across networks during the selected time period."
                data={impressions}
                chartType="area"
                tableRows={[
                  {
                    label: "Impressions",
                    value: t.impressions.total,
                    change: t.impressions.totalChange,
                    isSummary: true,
                  },
                  {
                    label: "Facebook Views",
                    value: t.impressions.facebook,
                    change: t.impressions.facebookChange,
                  },
                  {
                    label: "Instagram Views",
                    value: t.impressions.instagram,
                    change: t.impressions.instagramChange,
                  },
                ]}
              />
            </div>

            {/* Engagements */}
            <div className={cn(loading && "opacity-60 pointer-events-none")}>
              <MetricSection
                title="Engagements"
                description="See how people are engaging with your posts during the selected time period."
                data={engagements}
                chartType="area"
                tableRows={[
                  {
                    label: "Engagements",
                    value: t.engagements.total,
                    change: t.engagements.totalChange,
                    isSummary: true,
                  },
                  {
                    label: "Facebook Engagements",
                    value: t.engagements.facebook,
                    change: t.engagements.facebookChange,
                  },
                  {
                    label: "Instagram Engagements",
                    value: t.engagements.instagram,
                    change: t.engagements.instagramChange,
                  },
                ]}
              />
            </div>

            {/* Engagement Rate */}
            <div className={cn(loading && "opacity-60 pointer-events-none")}>
              <MetricSection
                title="Engagement Rate"
                description="See how engaged people are with your posts during the selected time period."
                data={engagementRate}
                chartType="line"
                isRate
                tableRows={[
                  {
                    label: "Engagement Rate (per Impression)",
                    value: `${t.engagementRate.total}%`,
                    change: t.engagementRate.totalChange,
                    isSummary: true,
                  },
                  {
                    label: "Facebook Engagement Rate",
                    value: `${t.engagementRate.facebook}%`,
                    change: t.engagementRate.facebookChange,
                  },
                  {
                    label: "Instagram Engagement Rate",
                    value: `${t.engagementRate.instagram}%`,
                    change: t.engagementRate.instagramChange,
                  },
                ]}
              />
            </div>

            {/* Video Views */}
            <div className={cn(loading && "opacity-60 pointer-events-none")}>
              <MetricSection
                title="Video Views"
                description="Track how many times your videos were viewed during the selected time period."
                data={videoViews}
                chartType="area"
                tableRows={[
                  {
                    label: "Video Views",
                    value: t.videoViews.total,
                    change: t.videoViews.totalChange,
                    isSummary: true,
                  },
                  {
                    label: "Facebook Video Views",
                    value: t.videoViews.facebook,
                    change: t.videoViews.facebookChange,
                  },
                  {
                    label: "Instagram Video Views",
                    value: t.videoViews.instagram,
                    change: t.videoViews.instagramChange,
                  },
                ]}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
