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
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DEMO_AUDIENCE_GROWTH,
  DEMO_ENGAGEMENT_RATE,
  DEMO_ENGAGEMENTS,
  DEMO_IMPRESSIONS,
  DEMO_TOTALS,
  type DayPoint,
} from "./demo-data";

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
    <div className="flex flex-col gap-1 border-r border-border/60 px-6 py-4 last:border-r-0">
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-bold tracking-tight text-foreground">{value}</span>
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
  tableRows: Array<{ label: string; value: string | number; change: number; isSummary?: boolean }>;
}

function MetricSection({ title, description, data, chartType, isRate = false, tableRows }: MetricSectionProps) {
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
        {/* Chart */}
        <div className="h-[200px] w-full">
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
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => isRate ? `${v}%` : fmt(v)} width={40} />
                <Tooltip content={<CustomTooltip isRate={isRate} />} />
                <Area type="monotone" dataKey="facebook" name="facebook" stroke={FB_COLOR} fill={`url(#grad-fb-${title})`} strokeWidth={2} />
                <Area type="monotone" dataKey="instagram" name="instagram" stroke={IG_COLOR} fill={`url(#grad-ig-${title})`} strokeWidth={2} />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => isRate ? `${v}%` : fmt(v)} width={40} />
                <Tooltip content={<CustomTooltip isRate={isRate} />} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                <Line type="monotone" dataKey="facebook" name="facebook" stroke={FB_COLOR} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="instagram" name="instagram" stroke={IG_COLOR} dot={false} strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
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

        {/* Data table */}
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-2 text-left font-medium text-muted-foreground">{title} Metrics</th>
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
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth()); // 0-based
  const [demoMode, setDemoMode] = React.useState(true);
  const [demoBannerOpen, setDemoBannerOpen] = React.useState(true);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const prevMonthLabel = month === 0
    ? `${MONTHS[11]} ${year - 1}`
    : `${MONTHS[month - 1]} ${year}`;

  const t = DEMO_TOTALS;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Toolbar ── */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5" onClick={prevMonth}>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[140px] text-center text-[13px] font-semibold text-foreground">
              {MONTHS[month]} {year}
            </span>
            <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5" onClick={nextMonth}>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <span className="ml-1 text-[11.5px] text-muted-foreground hidden sm:inline">
              vs {prevMonthLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">Demo mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={demoMode}
              onClick={() => setDemoMode(v => !v)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                demoMode ? "bg-[hsl(var(--brand))]" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  demoMode ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* Demo mode banner */}
        {demoMode && demoBannerOpen && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-[hsl(var(--brand))]/20 bg-[hsl(var(--brand-soft))] px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--brand))]">Report Demo Mode</p>
              <p className="mt-0.5 text-[12px] text-[hsl(var(--brand))]/80">
                These are sample analytics to show what this report looks like fully rendered. Connect a client&apos;s Facebook or Instagram to see real data.
              </p>
            </div>
            <button type="button" onClick={() => setDemoBannerOpen(false)} className="shrink-0 text-[hsl(var(--brand))]/60 hover:text-[hsl(var(--brand))]">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Performance Summary ── */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[15px] font-semibold">Performance Summary</CardTitle>
            <p className="text-[12px] text-muted-foreground">View your key profile performance metrics accrued during the selected time period.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60 lg:grid-cols-4">
              <KpiCard label="Impressions" value={fmt(t.impressions.total)} change={t.impressions.totalChange} />
              <KpiCard label="Engagements" value={fmt(t.engagements.total)} change={t.engagements.totalChange} />
              <KpiCard label="Post Link Clicks" value={fmt(t.postLinkClicks.total)} change={t.postLinkClicks.totalChange} />
              <KpiCard label="Engagement Rate (per Impression)" value={`${t.engagementRate.total}%`} change={t.engagementRate.totalChange} />
            </div>
          </CardContent>
        </Card>

        {/* ── Audience Growth ── */}
        <MetricSection
          title="Audience Growth"
          description="See how your audience grew during the selected time period."
          data={DEMO_AUDIENCE_GROWTH}
          chartType="line"
          tableRows={[
            { label: "Net Audience Growth", value: t.audienceGrowth.total, change: t.audienceGrowth.totalChange, isSummary: true },
            { label: "Facebook Net Follower Growth", value: t.audienceGrowth.facebook, change: t.audienceGrowth.facebookChange },
            { label: "Instagram Net Follower Growth", value: t.audienceGrowth.instagram, change: t.audienceGrowth.instagramChange },
          ]}
        />

        {/* ── Impressions ── */}
        <MetricSection
          title="Impressions"
          description="Review how your content was seen across networks during the selected time period."
          data={DEMO_IMPRESSIONS}
          chartType="area"
          tableRows={[
            { label: "Impressions", value: t.impressions.total, change: t.impressions.totalChange, isSummary: true },
            { label: "Facebook Views", value: t.impressions.facebook, change: t.impressions.facebookChange },
            { label: "Instagram Views", value: t.impressions.instagram, change: t.impressions.instagramChange },
          ]}
        />

        {/* ── Engagements ── */}
        <MetricSection
          title="Engagements"
          description="See how people are engaging with your posts during the selected time period."
          data={DEMO_ENGAGEMENTS}
          chartType="area"
          tableRows={[
            { label: "Engagements", value: t.engagements.total, change: t.engagements.totalChange, isSummary: true },
            { label: "Facebook Engagements", value: t.engagements.facebook, change: t.engagements.facebookChange },
            { label: "Instagram Engagements", value: t.engagements.instagram, change: t.engagements.instagramChange },
          ]}
        />

        {/* ── Engagement Rate ── */}
        <MetricSection
          title="Engagement Rate"
          description="See how engaged people are with your posts during the selected time period."
          data={DEMO_ENGAGEMENT_RATE}
          chartType="line"
          isRate
          tableRows={[
            { label: "Engagement Rate (per Impression)", value: `${t.engagementRate.total}%`, change: t.engagementRate.totalChange, isSummary: true },
            { label: "Facebook Engagement Rate", value: `${t.engagementRate.facebook}%`, change: t.engagementRate.facebookChange },
            { label: "Instagram Engagement Rate", value: `${t.engagementRate.instagram}%`, change: t.engagementRate.instagramChange },
          ]}
        />
      </div>
    </div>
  );
}
