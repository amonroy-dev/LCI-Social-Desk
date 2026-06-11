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

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 12, borderTop: "1px solid #e5e7eb", fontSize: 10, color: "#9ca3af" }}>
          LCI Social Desk &nbsp;·&nbsp; {generated} &nbsp;·&nbsp; Confidential — for internal and client use only
        </div>

      </div>
    </>
  );
}
