import { NextResponse, type NextRequest } from "next/server";

import {
  renderInviteEmail,
  renderReviewRequestEmail,
} from "@/lib/services/email-service";

export const runtime = "nodejs";

/**
 * Dev-only HTML preview of transactional email templates. Lets us tweak the
 * copy/markup without bouncing through Resend each time. Disabled outside of
 * the Next dev runtime so it can't leak into production.
 *
 *   GET /api/dev/email-preview/invite
 *   GET /api/dev/email-preview/review
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
    const { subject, html } = renderInviteEmail({
      to: "owner@northshore-dental.example",
      contactName: "Dr. Lin Tran",
      clientName: "Northshore Dental",
      agencyName,
      inviteUrl: "https://lci-360.example/connect/preview-token",
      networks: ["facebook", "instagram"],
    });
    return new NextResponse(buildShell(subject, html), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (type === "review") {
    const { subject, html } = renderReviewRequestEmail({
      to: "jamie@northshore-dental.example",
      reviewerName: "Jamie Chen",
      clientName: "Northshore Dental",
      reviewUrl: "https://lci-360.example/review/preview-token",
      caption:
        "Spring cleaning special: free whitening with any new patient exam booked in March. Call us to schedule and let our team know you saw the post! ✨",
      networks: ["facebook", "instagram"],
      schedule: { date: "2026-03-04", time: "09:00" },
    });
    return new NextResponse(buildShell(subject, html), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json(
    { error: `Unknown email type "${type}". Try "invite" or "review".` },
    { status: 404 },
  );
}

function buildShell(subject: string, bodyHtml: string): string {
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
    </style>
  </head>
  <body>
    <div class="pv-wrap">
      <div class="pv-meta">
        <div><strong>Subject</strong> ${escapeHtml(subject)}</div>
        <div><strong>From</strong> ${escapeHtml(process.env.EMAIL_FROM ?? `LCI Social Desk <noreply@resend.dev>`)}</div>
      </div>
      <div class="pv-email">${bodyHtml}</div>
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
