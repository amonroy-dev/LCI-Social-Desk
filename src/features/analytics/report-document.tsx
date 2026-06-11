"use client";

import * as React from "react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowDown, ArrowUp, Printer } from "lucide-react";
import type { AnalyticsResponse, AnalyticsTotals } from "./types";
import type { DayPoint } from "./types";

const FB_COLOR = "#1877F2";
const IG_COLOR = "#C13584";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Formatters ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
function fmtFull(n: number) { return n.toLocaleString(); }
function signed(n: number) { return (n >= 0 ? "+" : "") + fmtFull(n); }

// ── Plain-English summary ─────────────────────────────────────────────────────

function buildSummary(t: AnalyticsTotals, monthLabel: string, prevLabel: string): string[] {
  const dir = (v: number) => (v >= 0 ? "increased" : "decreased");
  const pct = (v: number) => `${Math.abs(v)}%`;
  return [
    `Impressions ${dir(t.impressions.totalChange)} ${pct(t.impressions.totalChange)} to ${fmtFull(t.impressions.total)} total views in ${monthLabel} vs. ${prevLabel}. Facebook contributed ${fmtFull(t.impressions.facebook)} views; Instagram contributed ${fmtFull(t.impressions.instagram)}.`,
    `Total engagements ${dir(t.engagements.totalChange)} ${pct(t.engagements.totalChange)} to ${fmtFull(t.engagements.total)}. Facebook drove ${fmtFull(t.engagements.facebook)} engagements; Instagram drove ${fmtFull(t.engagements.instagram)}.`,
    `The overall engagement rate was ${t.engagementRate.total}%, ${t.engagementRate.totalChange >= 0 ? "up" : "down"} ${pct(t.engagementRate.totalChange)} from ${prevLabel}. Facebook: ${t.engagementRate.facebook}% · Instagram: ${t.engagementRate.instagram}%.`,
    `Net audience growth was ${signed(t.audienceGrowth.total)} followers. Facebook ${t.audienceGrowth.facebook >= 0 ? "gained" : "lost"} ${Math.abs(t.audienceGrowth.facebook)}; Instagram ${t.audienceGrowth.instagram >= 0 ? "gained" : "lost"} ${Math.abs(t.audienceGrowth.instagram)}.`,
    ...(t.videoViews.total > 0
      ? [`Video views ${dir(t.videoViews.totalChange)} ${pct(t.videoViews.totalChange)} to ${fmtFull(t.videoViews.total)} total views. Facebook video views: ${fmtFull(t.videoViews.facebook)}.`]
      : []),
  ];
}

// ── Conclusion builder ───────────────────────────────────────────────────────

interface Finding { text: string; positive: boolean }

interface ConclusionData {
  narrative: string;
  highlights: Finding[];
  concerns: Finding[];
}

function buildConclusion(t: AnalyticsTotals, monthLabel: string): ConclusionData {
  const highlights: Finding[] = [];
  const concerns: Finding[] = [];

  // Impressions
  if (t.impressions.totalChange >= 10) {
    highlights.push({ positive: true, text: `Impressions grew ${t.impressions.totalChange}% — your content reached significantly more people than last month.` });
  } else if (t.impressions.totalChange <= -10) {
    concerns.push({ positive: false, text: `Impressions dropped ${Math.abs(t.impressions.totalChange)}% — content is reaching fewer people. Consider more consistent posting or boosting key posts.` });
  }

  // Engagements
  if (t.engagements.totalChange >= 10) {
    highlights.push({ positive: true, text: `Engagements increased ${t.engagements.totalChange}% — your audience is more actively interacting with your content.` });
  } else if (t.engagements.totalChange <= -10) {
    concerns.push({ positive: false, text: `Engagements declined ${Math.abs(t.engagements.totalChange)}% — content may not be resonating as strongly. Try varying formats: polls, questions, short-form video.` });
  }

  // Facebook engagement rate vs industry benchmark (avg 0.5–1%, good = 1%+)
  const fbRate = t.engagementRate.facebook;
  if (fbRate >= 1) {
    highlights.push({ positive: true, text: `Facebook engagement rate of ${fbRate}% beats the industry average of 0.5–1% — your content is performing above benchmark.` });
  } else if (fbRate > 0 && fbRate < 0.5) {
    concerns.push({ positive: false, text: `Facebook engagement rate of ${fbRate}% is below the industry average of 0.5–1%. More interactive content formats (video, polls, stories) typically improve this.` });
  }

  // Instagram engagement rate vs industry benchmark (avg 1–3%, good = 3%+)
  const igRate = t.engagementRate.instagram;
  if (igRate >= 3) {
    highlights.push({ positive: true, text: `Instagram engagement rate of ${igRate}% exceeds the industry average of 1–3% — strong audience connection on Instagram.` });
  } else if (igRate > 0 && igRate < 1) {
    concerns.push({ positive: false, text: `Instagram engagement rate of ${igRate}% is below the industry average of 1–3%. Reels consistently outperform static posts for engagement on this platform.` });
  }

  // Audience growth
  if (t.audienceGrowth.total > 0) {
    highlights.push({ positive: true, text: `Gained ${fmtFull(t.audienceGrowth.total)} net new followers — your audience is growing organically.` });
  } else if (t.audienceGrowth.total < 0) {
    concerns.push({ positive: false, text: `Net audience loss of ${fmtFull(Math.abs(t.audienceGrowth.total))} followers this month. Consistent posting and engagement with comments helps retain followers.` });
  }

  // Video views
  if (t.videoViews.total > 0 && t.videoViews.totalChange >= 10) {
    highlights.push({ positive: true, text: `Video views grew ${t.videoViews.totalChange}% — video content is connecting well with your audience.` });
  } else if (t.videoViews.total > 0 && t.videoViews.totalChange <= -20) {
    concerns.push({ positive: false, text: `Video views declined ${Math.abs(t.videoViews.totalChange)}%. Publishing more video content — especially short-form Reels — can reverse this trend.` });
  }

  // Overall narrative based on balance of findings
  const h = highlights.length;
  const c = concerns.length;
  let narrative = "";
  if (h >= 3 && c <= 1) {
    narrative = `Overall, ${monthLabel} was a strong month for your social media presence. The majority of key metrics are trending positively, which tells us that your content strategy is working and your audience is engaged. We're sharing these numbers exactly as they are — no spin — because you deserve to see the full picture.`;
  } else if (h >= 2 && c >= 2) {
    narrative = `${monthLabel} showed a mixed performance picture with genuine bright spots alongside areas to sharpen. This is normal — social media performance fluctuates month to month based on content mix, algorithm changes, and audience behavior. We've highlighted both what's working and where we can improve.`;
  } else if (c >= 3) {
    narrative = `${monthLabel} presented challenges across several key metrics. We believe in full transparency: when numbers dip, you deserve to know exactly what happened and what we recommend doing about it. This report shows every metric as-is, with honest context and actionable next steps.`;
  } else if (h === 0 && c === 0) {
    narrative = `${monthLabel} was a steady month — performance held consistent without significant movement in either direction. This is common during periods of regular, stable posting. The data below gives you the complete picture.`;
  } else {
    narrative = `${monthLabel} was a solid month with more positives than concerns. Your social media presence continued to build momentum. Below is an honest breakdown of what the numbers mean and where attention should be focused going forward.`;
  }

  return { narrative, highlights, concerns };
}

// ── Trend indicator ──────────────────────────────────────────────────────────

function Trend({ v }: { v: number }) {
  return v >= 0
    ? <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 600 }}>▲ {Math.abs(v)}%</span>
    : <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 600 }}>▼ {Math.abs(v)}%</span>;
}

// ── Print-aware chart wrapper ─────────────────────────────────────────────────
// Listens to beforeprint / afterprint to switch Recharts from responsive to
// fixed-width so it renders correctly in the browser's print renderer.

const PRINT_CHART_WIDTH = 620;
const PRINT_CHART_HEIGHT = 110;
const SCREEN_CHART_HEIGHT = 150;

interface ChartProps {
  data: DayPoint[];
  type: "area" | "line";
  isRate?: boolean;
}

function ReportChart({ data, type, isRate = false }: ChartProps) {
  const [printing, setPrinting] = React.useState(false);

  React.useEffect(() => {
    const before = () => setPrinting(true);
    const after = () => setPrinting(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  const chartData = data.map((d) => ({ day: d.day, facebook: d.facebook, instagram: d.instagram }));
  const tickFmt = (v: number) => isRate ? `${v}%` : fmt(v);
  const h = printing ? PRINT_CHART_HEIGHT : SCREEN_CHART_HEIGHT;

  const sharedAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
      <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} interval={4} />
      <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} tickFormatter={tickFmt} width={38} />
      <Tooltip
        contentStyle={{ fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 4, boxShadow: "none" }}
        formatter={(v: unknown, name: unknown) => [isRate ? `${v}%` : fmtFull(Number(v ?? 0)), String(name ?? "")]}
      />
    </>
  );

  if (printing) {
    return type === "area" ? (
      <AreaChart width={PRINT_CHART_WIDTH} height={h} data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={FB_COLOR} stopOpacity={0.35} /><stop offset="95%" stopColor={FB_COLOR} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="pi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={IG_COLOR} stopOpacity={0.35} /><stop offset="95%" stopColor={IG_COLOR} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {sharedAxes}
        <Area type="monotone" dataKey="facebook" name="Facebook" stroke={FB_COLOR} fill="url(#pf)" strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="instagram" name="Instagram" stroke={IG_COLOR} fill="url(#pi)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    ) : (
      <LineChart width={PRINT_CHART_WIDTH} height={h} data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        {sharedAxes}
        <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
        <Line type="monotone" dataKey="facebook" name="Facebook" stroke={FB_COLOR} dot={false} strokeWidth={1.5} />
        <Line type="monotone" dataKey="instagram" name="Instagram" stroke={IG_COLOR} dot={false} strokeWidth={1.5} />
      </LineChart>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={h}>
      {type === "area" ? (
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={FB_COLOR} stopOpacity={0.35} /><stop offset="95%" stopColor={FB_COLOR} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="si" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={IG_COLOR} stopOpacity={0.35} /><stop offset="95%" stopColor={IG_COLOR} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {sharedAxes}
          <Area type="monotone" dataKey="facebook" name="Facebook" stroke={FB_COLOR} fill="url(#sf)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="instagram" name="Instagram" stroke={IG_COLOR} fill="url(#si)" strokeWidth={1.5} dot={false} />
        </AreaChart>
      ) : (
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          {sharedAxes}
          <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
          <Line type="monotone" dataKey="facebook" name="Facebook" stroke={FB_COLOR} dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="instagram" name="Instagram" stroke={IG_COLOR} dot={false} strokeWidth={1.5} />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

// ── Section component ─────────────────────────────────────────────────────────

interface SectionRow { label: string; value: string | number; change: number; bold?: boolean }

interface SectionProps {
  title: string;
  description: string;
  data: DayPoint[];
  type: "area" | "line";
  isRate?: boolean;
  rows: SectionRow[];
  pageBreak?: boolean;
}

function Section({ title, description, data, type, isRate, rows, pageBreak }: SectionProps) {
  return (
    <div className={pageBreak ? "rpt-pagebreak" : ""} style={{ marginBottom: 32 }}>
      <div className="rpt-section">
        {/* Section header */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>{title}</h2>
          <p style={{ margin: "2px 0 0", fontSize: 10.5, color: "#6b7280" }}>{description}</p>
        </div>

        {/* Chart */}
        <div style={{ marginBottom: 6 }}>
          <ReportChart data={data} type={type} isRate={isRate} />
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          {[{ color: FB_COLOR, label: "Facebook" }, { color: IG_COLOR, label: "Instagram" }].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 10, color: "#6b7280" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Data table */}
        <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid #d1d5db" }}>
              <th style={{ padding: "5px 0", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 10.5 }}>{title} Metrics</th>
              <th style={{ padding: "5px 0", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: 10.5 }}>Total</th>
              <th style={{ padding: "5px 0", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: 10.5 }}>vs. Prev. Month</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "5px 0", color: "#111827", fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
                <td style={{ padding: "5px 0", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#111827", fontWeight: row.bold ? 700 : 400 }}>
                  {typeof row.value === "number" ? fmtFull(row.value) : row.value}
                </td>
                <td style={{ padding: "5px 0", textAlign: "right" }}>
                  <Trend v={row.change} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface ReportDocumentProps {
  data: AnalyticsResponse;
  year: number;
  month: number; // 1-12
  clientName: string;
  isDemo: boolean;
}

export function ReportDocument({ data, year, month, clientName, isDemo }: ReportDocumentProps) {
  const monthLabel = `${MONTHS[month - 1]} ${year}`;
  const prevLabel = month === 1 ? `${MONTHS[11]} ${year - 1}` : `${MONTHS[month - 2]} ${year}`;
  const t = data.totals;
  const summary = buildSummary(t, monthLabel, prevLabel);
  const generated = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      {/* ── Global print CSS ── */}
      <style>{`
        /* Document base */
        body {
          margin: 0;
          padding: 0;
          background: #f9fafb;
          font-family: -apple-system, "Inter", "Segoe UI", Helvetica, Arial, sans-serif;
          color: #111827;
          -webkit-font-smoothing: antialiased;
        }

        /* Screen wrapper */
        .rpt-screen-wrap {
          max-width: 780px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }

        /* Section: prevent break inside chart+table unit */
        .rpt-section {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* Force page break before major sections */
        .rpt-pagebreak {
          break-before: page;
          page-break-before: always;
        }

        /* Widow / orphan control */
        p { widows: 3; orphans: 3; }

        /* Hide scrollbars everywhere in print */
        @media print {
          ::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; overflow: visible !important; box-shadow: none !important; }

          body {
            background: white !important;
            font-size: 11pt;
          }

          /* Screen toolbar hidden */
          .rpt-toolbar { display: none !important; }

          /* Remove screen-only wrapper padding, let @page margins control spacing */
          .rpt-screen-wrap {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Recharts: ensure charts expand to full column width */
          .recharts-responsive-container,
          .recharts-wrapper {
            width: 100% !important;
            overflow: visible !important;
          }
        }

        @page {
          size: letter portrait;
          margin: 0.75in;
        }
      `}</style>

      {/* ── Screen-only toolbar ── */}
      <div className="rpt-toolbar" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "white", borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 24px", boxShadow: "0 1px 3px rgba(0,0,0,.06)",
      }}>
        <a href="/dashboard/analytics" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
          ← Back to Analytics
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#1d4ed8", color: "white",
            border: "none", borderRadius: 6, padding: "7px 14px",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <Printer size={14} />
          Print / Save as PDF
        </button>
      </div>

      {/* ── Report body ── */}
      <div className="rpt-screen-wrap">

        {/* ── Page 1: Cover + Summary + KPIs ── */}

        {/* Cover */}
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "2px solid #111827" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: 6 }}>
            LCI Marketing · Social Desk
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#111827" }}>
            Profile Performance Report
          </h1>
          <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
            {clientName} &nbsp;·&nbsp; {monthLabel} vs. {prevLabel}
            {isDemo && (
              <span style={{ marginLeft: 10, background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "1px 7px", fontSize: 10.5, fontWeight: 600 }}>
                DEMO DATA
              </span>
            )}
          </div>
          <div style={{ marginTop: 3, fontSize: 11, color: "#9ca3af" }}>
            Generated {generated} &nbsp;·&nbsp; Data sourced from Meta Graph API &nbsp;·&nbsp; For internal use only
          </div>
        </div>

        {/* Executive Summary */}
        <div className="rpt-section" style={{ marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>
            Executive Summary
          </h2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {summary.map((bullet, i) => (
              <li key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 12, lineHeight: 1.6, color: "#374151" }}>
                <span style={{ marginTop: 6, width: 5, height: 5, borderRadius: "50%", background: "#2563eb", flexShrink: 0, display: "inline-block" }} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Performance Summary KPIs */}
        <div className="rpt-section" style={{ marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
            Performance Summary
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: 10.5, color: "#6b7280" }}>
            Key profile metrics accrued during the selected time period.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Impressions", value: fmt(t.impressions.total), change: t.impressions.totalChange },
              { label: "Engagements", value: fmt(t.engagements.total), change: t.engagements.totalChange },
              { label: "Net Audience Growth", value: signed(t.audienceGrowth.total), change: t.audienceGrowth.totalChange },
              { label: "Engagement Rate", value: `${t.engagementRate.total}%`, change: t.engagementRate.totalChange },
            ].map((kpi) => (
              <div key={kpi.label} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{kpi.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>{kpi.value}</div>
                <Trend v={kpi.change} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Page 2: Platform Breakdown + Audience Growth ── */}

        {/* Platform breakdown — forced page break */}
        <div className="rpt-pagebreak rpt-section" style={{ marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
            Platform-by-Platform Breakdown
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: 10.5, color: "#6b7280" }}>
            All key metrics broken down by Facebook and Instagram for the selected period.
          </p>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #111827" }}>
                {["Platform","Impressions","Engagements","Eng. Rate","Audience Growth","Video Views"].map((h) => (
                  <th key={h} style={{ padding: "6px 4px", textAlign: h === "Platform" ? "left" : "right", fontWeight: 700, fontSize: 10.5, color: "#111827" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Facebook", color: FB_COLOR, imp: t.impressions.facebook, eng: t.engagements.facebook, rate: `${t.engagementRate.facebook}%`, aud: signed(t.audienceGrowth.facebook), vid: fmtFull(t.videoViews.facebook) },
                { name: "Instagram", color: IG_COLOR, imp: t.impressions.instagram, eng: t.engagements.instagram, rate: `${t.engagementRate.instagram}%`, aud: signed(t.audienceGrowth.instagram), vid: fmtFull(t.videoViews.instagram) },
              ].map((row) => (
                <tr key={row.name} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "6px 4px", fontWeight: 600, color: row.color }}>{row.name}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtFull(row.imp)}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtFull(row.eng)}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right" }}>{row.rate}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.aud}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.vid}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "1.5px solid #111827" }}>
                <td style={{ padding: "6px 4px", fontWeight: 700 }}>Total</td>
                <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(t.impressions.total)}</td>
                <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(t.engagements.total)}</td>
                <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700 }}>{t.engagementRate.total}%</td>
                <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{signed(t.audienceGrowth.total)}</td>
                <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(t.videoViews.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audience Growth */}
        <Section
          title="Audience Growth"
          description="See how your audience grew during the selected time period."
          data={data.audienceGrowth}
          type="line"
          rows={[
            { label: "Net Audience Growth", value: t.audienceGrowth.total, change: t.audienceGrowth.totalChange, bold: true },
            { label: "Facebook Net Follower Growth", value: t.audienceGrowth.facebook, change: t.audienceGrowth.facebookChange },
            { label: "Instagram Net Follower Growth", value: t.audienceGrowth.instagram, change: t.audienceGrowth.instagramChange },
          ]}
        />

        {/* ── Page 3: Impressions + Engagements ── */}

        <Section
          title="Impressions"
          description="Review how your content was seen across networks during the selected time period."
          data={data.impressions}
          type="area"
          pageBreak
          rows={[
            { label: "Total Impressions", value: t.impressions.total, change: t.impressions.totalChange, bold: true },
            { label: "Facebook Views", value: t.impressions.facebook, change: t.impressions.facebookChange },
            { label: "Instagram Views", value: t.impressions.instagram, change: t.impressions.instagramChange },
          ]}
        />

        <Section
          title="Engagements"
          description="See how people are engaging with your posts during the selected time period."
          data={data.engagements}
          type="area"
          rows={[
            { label: "Total Engagements", value: t.engagements.total, change: t.engagements.totalChange, bold: true },
            { label: "Facebook Engagements", value: t.engagements.facebook, change: t.engagements.facebookChange },
            { label: "Instagram Engagements", value: t.engagements.instagram, change: t.engagements.instagramChange },
          ]}
        />

        {/* ── Page 4: Engagement Rate + Video Views ── */}

        <Section
          title="Engagement Rate"
          description="See how engaged people are with your posts during the selected time period."
          data={data.engagementRate}
          type="line"
          isRate
          pageBreak
          rows={[
            { label: "Engagement Rate (per Impression)", value: `${t.engagementRate.total}%`, change: t.engagementRate.totalChange, bold: true },
            { label: "Facebook Engagement Rate", value: `${t.engagementRate.facebook}%`, change: t.engagementRate.facebookChange },
            { label: "Instagram Engagement Rate", value: `${t.engagementRate.instagram}%`, change: t.engagementRate.instagramChange },
          ]}
        />

        <Section
          title="Video Views"
          description="Track how many times your videos were viewed during the selected time period."
          data={data.videoViews}
          type="area"
          rows={[
            { label: "Total Video Views", value: t.videoViews.total, change: t.videoViews.totalChange, bold: true },
            { label: "Facebook Video Views", value: t.videoViews.facebook, change: t.videoViews.facebookChange },
            { label: "Instagram Video Views", value: t.videoViews.instagram, change: t.videoViews.instagramChange },
          ]}
        />

        {/* ── Page 5: Conclusion ── */}
        {t !== null && (() => {
          const conc = buildConclusion(t, monthLabel);
          return (
            <div className="rpt-pagebreak">
              {/* Page header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  Page 5 of 5
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
                  Understanding Your Report
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>
                  Plain-English explanations of every metric, industry benchmarks, and an honest assessment of this month&apos;s performance.
                </p>
              </div>

              {/* Overall performance assessment */}
              <div className="rpt-section" style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px 18px", marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                  Overall Performance — {monthLabel}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "#374151", lineHeight: 1.7 }}>
                  {conc.narrative}
                </p>
              </div>

              {/* Highlights + Concerns side by side */}
              <div className="rpt-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {/* Highlights */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#15803d", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                    ✓ What&apos;s Working
                  </div>
                  {conc.highlights.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>No standout positives this month — see areas for attention.</p>
                  ) : (
                    <ul style={{ margin: 0, padding: "0 0 0 14px", listStyle: "disc" }}>
                      {conc.highlights.map((h, i) => (
                        <li key={i} style={{ fontSize: 11, color: "#166534", lineHeight: 1.6, marginBottom: 5 }}>
                          {h.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Concerns */}
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#92400e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                    ⚠ Areas for Attention
                  </div>
                  {conc.concerns.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>No significant concerns this month — great work!</p>
                  ) : (
                    <ul style={{ margin: 0, padding: "0 0 0 14px", listStyle: "disc" }}>
                      {conc.concerns.map((c, i) => (
                        <li key={i} style={{ fontSize: 11, color: "#78350f", lineHeight: 1.6, marginBottom: 5 }}>
                          {c.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Metric glossary */}
              <div className="rpt-section" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12, borderBottom: "1px solid #e5e7eb", paddingBottom: 6 }}>
                  What These Numbers Mean
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                  {[
                    {
                      icon: "📊",
                      label: "Impressions",
                      what: "The number of times your content appeared in someone's feed or search results — whether or not they clicked.",
                      why: "Measures your brand's reach and visibility. More impressions means more people are being exposed to your brand.",
                      benchmark: "Track month-over-month growth. Consistent upward trends are the goal.",
                    },
                    {
                      icon: "👥",
                      label: "Engagements",
                      what: "Total actions taken on your posts: likes, comments, shares, saves, and link clicks.",
                      why: "Shows whether content is resonating. Each engagement is someone actively choosing to interact with your brand.",
                      benchmark: "Higher is better. Upward month-over-month trends indicate a healthy, connected audience.",
                    },
                    {
                      icon: "📈",
                      label: "Engagement Rate",
                      what: "The percentage of people who saw your content and took an action. Formula: (Engagements ÷ Impressions) × 100.",
                      why: "The most important quality metric. High impressions with low engagement means content isn't connecting.",
                      benchmark: "Facebook: avg 0.5–1%, good = 1–3%+. Instagram: avg 1–3%, good = 3–6%+.",
                    },
                    {
                      icon: "👤",
                      label: "Audience Growth",
                      what: "Net new followers gained during the period (new followers minus unfollows).",
                      why: "A growing audience expands your organic reach each month. Every new follower opted in to hear from your brand regularly.",
                      benchmark: "Any positive number is progress. Consistent growth compounds significantly over time.",
                    },
                    {
                      icon: "🎬",
                      label: "Video Views",
                      what: "Number of times video content was played (typically counted after 3+ seconds of viewing).",
                      why: "Video is the highest-performing format on both Facebook and Instagram. Strong numbers indicate content is capturing attention.",
                      benchmark: "Upward month-over-month trends. Short-form Reels typically outperform longer video content.",
                    },
                  ].map((m) => (
                    <div key={m.label} style={{ borderLeft: "3px solid #e5e7eb", paddingLeft: 10, marginBottom: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                        {m.icon} {m.label}
                      </div>
                      <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.55, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600 }}>What it is: </span>{m.what}
                      </div>
                      <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.55, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600 }}>Why it matters: </span>{m.why}
                      </div>
                      <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.55 }}>
                        <span style={{ fontWeight: 600 }}>Benchmark: </span>{m.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transparency commitment */}
              <div className="rpt-section" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "14px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1e40af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                  Our Commitment to Transparency
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "#1e3a8a", lineHeight: 1.7 }}>
                  At LCI, we believe you should always know exactly how your social media is performing — the wins and the areas that need work. Every number in this report is real and unaltered. We don&apos;t cherry-pick metrics or hide underperforming figures. Our goal is to give you honest data so we can make smart decisions together and build a social presence your audience genuinely connects with.
                </p>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 12, borderTop: "1px solid #e5e7eb", fontSize: 10, color: "#9ca3af" }}>
          LCI Social Desk &nbsp;·&nbsp; {generated} &nbsp;·&nbsp; Confidential — for internal and client use only
        </div>

      </div>
    </>
  );
}
