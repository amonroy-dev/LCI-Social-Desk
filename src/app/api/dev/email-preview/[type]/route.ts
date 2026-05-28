import { NextResponse, type NextRequest } from "next/server";

import {
  buildInviteTemplateVariables,
  buildReviewTemplateVariables,
  renderInviteEmail,
  renderReviewRequestEmail,
} from "@/lib/services/email-service";

export const runtime = "nodejs";

/**
 * Dev-only HTML preview of transactional email templates.
 *
 *   GET /api/dev/email-preview/invite
 *   GET /api/dev/email-preview/review
 *
 * Renders the built-in fallback HTML for the given email type so the copy
 * and layout can be iterated on without bouncing through Resend each time.
 *
 * Below the rendered email, the page also lists the template variable
 * payload that would be sent to a Resend hosted template
 * (RESEND_REVIEW_TEMPLATE_ID / RESEND_INVITE_TEMPLATE_ID). This makes it
 * easy to know which {{VARIABLE}} names to use when designing a template
 * in the Resend dashboard.
 *
 * Returns 404 in production so it never leaks to live.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ type: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Email preview is disabled in production." },
      { status: 404 },
    );
  }

  const { type } = await context.params;
  const agencyName = process.env.NEXT_PUBLIC_AGENCY_NAME ?? "LCI";

  if (type === "invite") {
    const sampleInput = {
      to: "owner@northshore-dental.example",
      contactName: "Dr. Lin Tran",
      clientName: "Northshore Dental",
      agencyName,
      inviteUrl: "https://lci-360.example/connect/preview-token",
      networks: ["facebook", "instagram"],
    };
    const { subject, html } = renderInviteEmail(sampleInput);
    const variables = buildInviteTemplateVariables(sampleInput);
    return new NextResponse(
      buildShell({
        subject,
        bodyHtml: html,
        variables,
        templateEnvVar: "RESEND_INVITE_TEMPLATE_ID",
        templateIdSet: !!process.env.RESEND_INVITE_TEMPLATE_ID,
      }),
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (type === "review") {
    const sampleInput = {
      to: "jamie@northshore-dental.example",
      reviewerName: "Jamie Chen",
      clientName: "Northshore Dental",
      reviewUrl: "https://lci-360.example/review/preview-token",
      caption:
        "Spring cleaning special: free whitening with any new patient exam booked in March. Call us to schedule and let our team know you saw the post! ✨",
      networks: ["facebook", "instagram"],
      schedule: { date: "2026-03-04", time: "09:00" },
    };
    const { subject, html } = renderReviewRequestEmail(sampleInput);
    const variables = buildReviewTemplateVariables(sampleInput);
    return new NextResponse(
      buildShell({
        subject,
        bodyHtml: html,
        variables,
        templateEnvVar: "RESEND_REVIEW_TEMPLATE_ID",
        templateIdSet: !!process.env.RESEND_REVIEW_TEMPLATE_ID,
      }),
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  return NextResponse.json(
    { error: `Unknown email type "${type}". Try "invite" or "review".` },
    { status: 404 },
  );
}

function buildShell({
  subject,
  bodyHtml,
  variables,
  templateEnvVar,
  templateIdSet,
}: {
  subject: string;
  bodyHtml: string;
  variables: Record<string, string>;
  templateEnvVar: string;
  templateIdSet: boolean;
}): string {
  const variableRows = Object.entries(variables)
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding: 6px 12px 6px 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #0f172a; white-space: nowrap; vertical-align: top;">{{${escapeHtml(k)}}}</td>
          <td style="padding: 6px 0; font-size: 12.5px; color: #334155; word-break: break-word;">${escapeHtml(v)}</td>
        </tr>`,
    )
    .join("");

  const banner = templateIdSet
    ? `<div style="background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; padding: 10px 14px; border-radius: 6px; font-size: 12.5px; margin-bottom: 14px;">
        <strong>Template mode is ON.</strong> Live sends use your Resend-hosted template
        (<code style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">${escapeHtml(templateEnvVar)}</code> is set).
        The HTML below is only the local fallback — your Resend template renders the real email using the variables listed at the bottom.
      </div>`
    : `<div style="background: #fff7ed; border: 1px solid #fdba74; color: #9a3412; padding: 10px 14px; border-radius: 6px; font-size: 12.5px; margin-bottom: 14px;">
        <strong>Template mode is OFF.</strong> Set <code style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">${escapeHtml(templateEnvVar)}</code>
        to a published Resend template id or alias and the email below will be replaced by Resend's hosted version, using the variables listed at the bottom.
      </div>`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
    <style>
      body { background: #f1f5f9; margin: 0; padding: 32px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .pv-wrap { max-width: 640px; margin: 0 auto; }
      .pv-meta { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; font-size: 12.5px; color: #475569; }
      .pv-meta strong { color: #0f172a; display: inline-block; min-width: 70px; }
      .pv-email { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
      .pv-vars { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-top: 16px; }
      .pv-vars h2 { font-size: 13px; margin: 0 0 4px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; }
      .pv-vars p { font-size: 12px; color: #64748b; margin: 0 0 10px; }
      .pv-vars table { border-collapse: collapse; width: 100%; }
    </style>
  </head>
  <body>
    <div class="pv-wrap">
      ${banner}
      <div class="pv-meta">
        <div><strong>Subject</strong> ${escapeHtml(subject)}</div>
        <div><strong>From</strong> ${escapeHtml(process.env.EMAIL_FROM ?? `LCI Social Desk <noreply@resend.dev>`)}</div>
      </div>
      <div class="pv-email">${bodyHtml}</div>
      <div class="pv-vars">
        <h2>Template variables sent to Resend</h2>
        <p>Reference these as <code>{{VARIABLE_NAME}}</code> in your Resend dashboard template.</p>
        <table>${variableRows}</table>
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
