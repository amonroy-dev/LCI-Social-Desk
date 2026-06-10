"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, ArrowUp, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsResponse, AnalyticsTotals } from "./types";
import type { DayPoint } from "./types";

const FB_COLOR = "#1877F2";
const IG_COLOR = "#E1306C";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function fmtFull(n: number): string {
  return n.toLocaleString();
}

function signedFull(n: number): string {
  return (n >= 0 ? "+" : "") + fmtFull(n);
}

function TrendBadge({ change }: { change: number }) {
  const pos = change >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11.5px] font-semibold", pos ? "text-emerald-600" : "text-red-500")}>
      {pos ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(change)}%
    </span>
  );
}

function generateSummary(t: AnalyticsTotals, monthLabel: string, prevMonthLabel: string): string[] {
  const dir = (v: number) => v >= 0 ? "increased" : "decreased";
  const pct = (v: number) => `${Math.abs(v)}%`;

  const bullets: string[] = [];

  bullets.push(
    `Impressions ${dir(t.impressions.totalChange)} ${pct(t.impressions.totalChange)} to ${fmtFull(t.impressions.total)} total views in ${monthLabel}, compared to ${prevMonthLabel}. ` +
    `Facebook contributed ${fmtFull(t.impressions.facebook)} views while Instagram contributed ${fmtFull(t.impressions.instagram)}.`
  );

  bullets.push(
    `Total engagements ${dir(t.engagements.totalChange)} ${pct(t.engagements.totalChange)} to ${fmtFull(t.engagements.total)}. ` +
    `Facebook drove ${fmtFull(t.engagements.facebook)} engagements and Instagram drove ${fmtFull(t.engagements.instagram)}.`
  );

  bullets.push(
    `The overall engagement rate was ${t.engagementRate.total}%, ${t.engagementRate.totalChange >= 0 ? "up" : "down"} ${pct(t.engagementRate.totalChange)} from ${prevMonthLabel}. ` +
    `Facebook had a ${t.engagementRate.facebook}% rate and Instagram had ${t.engagementRate.instagram}%.`
  );

  const net = t.audienceGrowth.total;
  bullets.push(
    `Net audience growth was ${signedFull(net)} followers across platforms. ` +
    `Facebook ${t.audienceGrowth.facebook >= 0 ? "gained" : "lost"} ${Math.abs(t.audienceGrowth.facebook)} followers; ` +
    `Instagram ${t.audienceGrowth.instagram >= 0 ? "gained" : "lost"} ${Math.abs(t.audienceGrowth.instagram)}.`
  );

  if (t.videoViews.total > 0) {
    bullets.push(
      `Video views ${dir(t.videoViews.totalChange)} ${pct(t.videoViews.totalChange)} to ${fmtFull(t.videoViews.total)} total views. ` +
      `Facebook accounted for ${fmtFull(t.videoViews.facebook)} video views.`
    );
  }

  return bullets;
}

interface ReportChartProps {
  data: DayPoint[];
  chartType: "area" | "line";
  isRate?: boolean;
}

function ReportChart({ data, chartType, isRate = false }: ReportChartProps) {
  const chartData = data.map((d) => ({ day: d.day, facebook: d.facebook, instagram: d.instagram }));
  const tickFmt = (v: number) => isRate ? `${v}%` : fmt(v);

  const shared = {
    data: chartData,
    margin: { top: 4, right: 4, left: 0, bottom: 0 },
  };

  return (
    <div style={{ width: "100%", height: 140 }}>
      {chartType === "area" ? (
        <AreaChart width={700} height={140} {...shared}>
          <defs>
            <linearGradient id="rpt-fb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={FB_COLOR} stopOpacity={0.4} />
              <stop offset="95%" stopColor={FB_COLOR} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="rpt-ig" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={IG_COLOR} stopOpacity={0.4} />
              <stop offset="95%" stopColor={IG_COLOR} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={tickFmt} width={36} />
          <Tooltip />
          <Area type="monotone" dataKey="facebook" name="Facebook" stroke={FB_COLOR} fill="url(#rpt-fb)" strokeWidth={2} />
          <Area type="monotone" dataKey="instagram" name="Instagram" stroke={IG_COLOR} fill="url(#rpt-ig)" strokeWidth={2} />
        </AreaChart>
      ) : (
        <LineChart width={700} height={140} {...shared}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={tickFmt} width={36} />
          <Tooltip />
          <ReferenceLine y={0} stroke="#e5e7eb" />
          <Line type="monotone" dataKey="facebook" name="Facebook" stroke={FB_COLOR} dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="instagram" name="Instagram" stroke={IG_COLOR} dot={false} strokeWidth={2} />
        </LineChart>
      )}
    </div>
  );
}

interface ReportSectionProps {
  title: string;
  description: string;
  data: DayPoint[];
  chartType: "area" | "line";
  isRate?: boolean;
  tableRows: Array<{ label: string; value: string | number; change: number; isSummary?: boolean }>;
}

function ReportSection({ title, description, data, chartType, isRate, tableRows }: ReportSectionProps) {
  return (
    <div className="report-section mb-8">
      <h2 className="mb-0.5 text-[14px] font-bold tracking-tight text-gray-900">{title}</h2>
      <p className="mb-3 text-[11.5px] text-gray-500">{description}</p>

      <div className="mb-2 rounded border border-gray-200 bg-white p-3 overflow-x-auto">
        <ReportChart data={data} chartType={chartType} isRate={isRate} />
        <div className="mt-2 flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: FB_COLOR }} />
            <span className="text-[10.5px] text-gray-500">Facebook</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: IG_COLOR }} />
            <span className="text-[10.5px] text-gray-500">Instagram</span>
          </div>
        </div>
      </div>

      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-1.5 text-left font-medium text-gray-500">{title} Metrics</th>
            <th className="py-1.5 text-right font-medium text-gray-500">Totals</th>
            <th className="py-1.5 text-right font-medium text-gray-500">% Change</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row) => (
            <tr key={row.label} className={cn("border-b border-gray-100 last:border-0", row.isSummary && "font-semibold")}>
              <td className="py-1.5 text-gray-800">{row.label}</td>
              <td className="py-1.5 text-right tabular-nums text-gray-800">
                {typeof row.value === "number" ? fmtFull(row.value) : row.value}
              </td>
              <td className="py-1.5 text-right"><TrendBadge change={row.change} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface ReportDocumentProps {
  data: AnalyticsResponse;
  year: number;
  month: number; // 1-12
  clientName: string;
  isDemo: boolean;
}

export function ReportDocument({ data, year, month, clientName, isDemo }: ReportDocumentProps) {
  const monthLabel = `${MONTHS[month - 1]} ${year}`;
  const prevMonthLabel = month === 1 ? `${MONTHS[11]} ${year - 1}` : `${MONTHS[month - 2]} ${year}`;
  const t = data.totals;
  const summary = generateSummary(t, monthLabel, prevMonthLabel);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-section { page-break-inside: avoid; break-inside: avoid; }
          .report-page-break { page-break-before: always; break-before: page; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 12px; }
          @page { margin: 0.75in; size: letter; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      {/* Screen-only toolbar */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <a href="/dashboard/analytics" className="text-[13px] text-gray-500 hover:text-gray-900">
          ← Back to Analytics
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--brand))] px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / Save as PDF
        </button>
      </div>

      {/* Report body */}
      <div className="mx-auto max-w-[760px] px-8 py-8 text-gray-900">

        {/* Cover / header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--brand))]">
            LCI Marketing · Social Desk
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">Profile Performance Report</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-500">
            <span>{clientName}</span>
            <span>·</span>
            <span>{monthLabel} vs. {prevMonthLabel}</span>
            {isDemo && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                Demo Data
              </span>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="report-section mb-8">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Executive Summary
          </h2>
          <ul className="space-y-2.5">
            {summary.map((bullet, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand))]" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Performance Summary KPIs */}
        <div className="report-section mb-8">
          <h2 className="mb-1 text-[14px] font-bold tracking-tight text-gray-900">Performance Summary</h2>
          <p className="mb-4 text-[11.5px] text-gray-500">
            View your key profile performance metrics accrued during the selected time period.
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Impressions", value: fmt(t.impressions.total), change: t.impressions.totalChange },
              { label: "Engagements", value: fmt(t.engagements.total), change: t.engagements.totalChange },
              { label: "Net Audience Growth", value: signedFull(t.audienceGrowth.total), change: t.audienceGrowth.totalChange },
              { label: "Engagement Rate", value: `${t.engagementRate.total}%`, change: t.engagementRate.totalChange },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded border border-gray-200 p-3">
                <div className="mb-1 text-[10.5px] text-gray-500">{kpi.label}</div>
                <div className="text-[20px] font-bold text-gray-900">{kpi.value}</div>
                <TrendBadge change={kpi.change} />
              </div>
            ))}
          </div>
        </div>

        {/* Platform-by-Platform Breakdown */}
        <div className="report-section report-page-break mb-8">
          <h2 className="mb-1 text-[14px] font-bold tracking-tight text-gray-900">Platform-by-Platform Breakdown</h2>
          <p className="mb-4 text-[11.5px] text-gray-500">
            Key metrics broken down by Facebook and Instagram for the selected time period.
          </p>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2 text-left font-semibold text-gray-700">Platform</th>
                <th className="py-2 text-right font-semibold text-gray-700">Impressions</th>
                <th className="py-2 text-right font-semibold text-gray-700">Engagements</th>
                <th className="py-2 text-right font-semibold text-gray-700">Eng. Rate</th>
                <th className="py-2 text-right font-semibold text-gray-700">Audience Growth</th>
                <th className="py-2 text-right font-semibold text-gray-700">Video Views</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium" style={{ color: FB_COLOR }}>Facebook</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.impressions.facebook)}</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.engagements.facebook)}</td>
                <td className="py-2 text-right tabular-nums">{t.engagementRate.facebook}%</td>
                <td className="py-2 text-right tabular-nums">{signedFull(t.audienceGrowth.facebook)}</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.videoViews.facebook)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium" style={{ color: IG_COLOR }}>Instagram</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.impressions.instagram)}</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.engagements.instagram)}</td>
                <td className="py-2 text-right tabular-nums">{t.engagementRate.instagram}%</td>
                <td className="py-2 text-right tabular-nums">{signedFull(t.audienceGrowth.instagram)}</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.videoViews.instagram)}</td>
              </tr>
              <tr className="font-semibold text-gray-900">
                <td className="py-2">Total</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.impressions.total)}</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.engagements.total)}</td>
                <td className="py-2 text-right tabular-nums">{t.engagementRate.total}%</td>
                <td className="py-2 text-right tabular-nums">{signedFull(t.audienceGrowth.total)}</td>
                <td className="py-2 text-right tabular-nums">{fmtFull(t.videoViews.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audience Growth */}
        <ReportSection
          title="Audience Growth"
          description="See how your audience grew during the selected time period."
          data={data.audienceGrowth}
          chartType="line"
          tableRows={[
            { label: "Net Audience Growth", value: t.audienceGrowth.total, change: t.audienceGrowth.totalChange, isSummary: true },
            { label: "Facebook Net Follower Growth", value: t.audienceGrowth.facebook, change: t.audienceGrowth.facebookChange },
            { label: "Instagram Net Follower Growth", value: t.audienceGrowth.instagram, change: t.audienceGrowth.instagramChange },
          ]}
        />

        {/* Impressions */}
        <div className="report-page-break">
          <ReportSection
            title="Impressions"
            description="Review how your content was seen across networks during the selected time period."
            data={data.impressions}
            chartType="area"
            tableRows={[
              { label: "Impressions", value: t.impressions.total, change: t.impressions.totalChange, isSummary: true },
              { label: "Facebook Views", value: t.impressions.facebook, change: t.impressions.facebookChange },
              { label: "Instagram Views", value: t.impressions.instagram, change: t.impressions.instagramChange },
            ]}
          />
        </div>

        {/* Engagements */}
        <ReportSection
          title="Engagements"
          description="See how people are engaging with your posts during the selected time period."
          data={data.engagements}
          chartType="area"
          tableRows={[
            { label: "Engagements", value: t.engagements.total, change: t.engagements.totalChange, isSummary: true },
            { label: "Facebook Engagements", value: t.engagements.facebook, change: t.engagements.facebookChange },
            { label: "Instagram Engagements", value: t.engagements.instagram, change: t.engagements.instagramChange },
          ]}
        />

        {/* Engagement Rate */}
        <div className="report-page-break">
          <ReportSection
            title="Engagement Rate"
            description="See how engaged people are with your posts during the selected time period."
            data={data.engagementRate}
            chartType="line"
            isRate
            tableRows={[
              { label: "Engagement Rate (per Impression)", value: `${t.engagementRate.total}%`, change: t.engagementRate.totalChange, isSummary: true },
              { label: "Facebook Engagement Rate", value: `${t.engagementRate.facebook}%`, change: t.engagementRate.facebookChange },
              { label: "Instagram Engagement Rate", value: `${t.engagementRate.instagram}%`, change: t.engagementRate.instagramChange },
            ]}
          />
        </div>

        {/* Video Views */}
        <ReportSection
          title="Video Views"
          description="Track how many times your videos were viewed during the selected time period."
          data={data.videoViews}
          chartType="area"
          tableRows={[
            { label: "Video Views", value: t.videoViews.total, change: t.videoViews.totalChange, isSummary: true },
            { label: "Facebook Video Views", value: t.videoViews.facebook, change: t.videoViews.facebookChange },
            { label: "Instagram Video Views", value: t.videoViews.instagram, change: t.videoViews.instagramChange },
          ]}
        />

        {/* Footer */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-[10.5px] text-gray-400">
          Generated by LCI Social Desk · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} ·
          Data sourced from Meta Graph API · For internal use only
        </div>
      </div>
    </>
  );
}
