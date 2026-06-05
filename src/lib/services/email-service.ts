import "server-only";

import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

function getAgencyName(): string {
  return process.env.NEXT_PUBLIC_AGENCY_NAME ?? "LCI";
}

function getFromAddress(): string | null {
  return process.env.EMAIL_FROM ?? null;
}

function getDefaultFromAddress(): string {
  // Used by the built-in fallback templates when EMAIL_FROM isn't set.
  return process.env.EMAIL_FROM ?? "LCI Social Desk <noreply@resend.dev>";
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/** Resend hosted template id (UUID) or alias for the review request email. */
function getReviewTemplateId(): string | null {
  const v = process.env.RESEND_REVIEW_TEMPLATE_ID?.trim();
  return v && v.length > 0 ? v : null;
}

/** Resend hosted template id (UUID) or alias for the connection invite email. */
function getInviteTemplateId(): string | null {
  const v = process.env.RESEND_INVITE_TEMPLATE_ID?.trim();
  return v && v.length > 0 ? v : null;
}

// ---------------------------------------------------------------------------
// Shared layout (built-in fallback templates)
// ---------------------------------------------------------------------------

interface LayoutInput {
  agencyName: string;
  title: string;
  greeting: string;
  introHtml: string;
  highlightHtml?: string;
  bullets: { heading: string; items: string[] };
  cta: { href: string; label: string };
  expiryNote: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmailLayout(input: LayoutInput): string {
  const safeAgency = escapeHtml(input.agencyName);
  const bullets = input.bullets.items
    .map(
      (item) =>
        `<li style="margin: 0 0 6px; padding: 0;">${item}</li>`,
    )
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #0f172a; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
      <div style="margin-bottom: 28px;">
        <span style="display: inline-block; padding: 6px 10px; background-color: #e6f4fb; color: #0e6a93; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; border-radius: 6px; letter-spacing: 0.08em;">
          ${safeAgency.toUpperCase().slice(0, 4)}
        </span>
      </div>

      <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 16px; color: #0f172a; line-height: 1.3;">
        ${escapeHtml(input.title)}
      </h1>

      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px; color: #334155;">
        ${escapeHtml(input.greeting)}
      </p>

      ${input.introHtml}

      ${input.highlightHtml ?? ""}

      <p style="font-size: 15px; font-weight: 700; margin: 22px 0 8px; color: #0f172a;">
        ${escapeHtml(input.bullets.heading)}
      </p>
      <ul style="font-size: 14.5px; line-height: 1.65; margin: 0 0 24px; padding: 0 0 0 22px; color: #334155;">
        ${bullets}
      </ul>

      <a href="${input.cta.href}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 22px; border-radius: 6px;">
        ${escapeHtml(input.cta.label)}
      </a>

      <p style="font-size: 13.5px; color: #475569; margin: 28px 0 6px; line-height: 1.55;">
        Questions? Just reply to this email and the ${safeAgency} team will help.
      </p>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 18px; line-height: 1.55;">
        ${escapeHtml(input.expiryNote)}
      </p>

      <p style="font-size: 13.5px; color: #334155; margin: 0;">
        — The ${safeAgency} team
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 14px;" />
      <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
        Sent via LCI Social Desk on behalf of ${safeAgency}.
      </p>
    </div>
  `;
}

function formatNetworks(networks: string[]): string {
  const labels = networks.map((n) => n.charAt(0).toUpperCase() + n.slice(1));
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Invite email — "connect your social accounts"
// ---------------------------------------------------------------------------

export interface SendInviteEmailInput {
  to: string;
  contactName: string | null;
  clientName: string;
  agencyName: string;
  inviteUrl: string;
  networks: string[];
}

export function buildInviteTemplateVariables(
  input: SendInviteEmailInput,
): Record<string, string> {
  const networkList = formatNetworks(input.networks);
  return {
    CUSTOMER_NAME: input.contactName?.trim() || "there",
    CLIENT_NAME: input.clientName,
    AGENCY_NAME: input.agencyName,
    NETWORKS: networkList,
    INVITE_URL: input.inviteUrl,
  };
}

export function renderInviteEmail(
  input: SendInviteEmailInput,
): { subject: string; html: string } {
  const networkList = formatNetworks(input.networks);
  const safeClient = escapeHtml(input.clientName);
  const safeAgency = escapeHtml(input.agencyName);
  const safeNetworks = escapeHtml(networkList);

  const subject = `Connect ${input.clientName}'s ${networkList} with ${input.agencyName}`;

  const introHtml = `
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px; color: #334155;">
      ${safeAgency} is set up to manage <strong>${safeClient}</strong>'s social media — we just need a quick one-time
      handoff so we can schedule and publish posts on your behalf.
    </p>
  `;

  return {
    subject,
    html: renderEmailLayout({
      agencyName: input.agencyName,
      title: `Let's connect ${networkList} for ${input.clientName}`,
      greeting: input.contactName ? `Hi ${input.contactName},` : "Hi,",
      introHtml,
      bullets: {
        heading: "Here's what happens when you click:",
        items: [
          `You're sent to ${safeNetworks} to approve access — no new account or password to remember.`,
          `We only get the permissions needed to publish ${safeClient}'s posts. Nothing else.`,
          `You can revoke access anytime from Meta's settings or by asking us.`,
        ],
      },
      cta: { href: input.inviteUrl, label: `Connect ${networkList}` },
      expiryNote: "This link expires in 14 days and is unique to your business — please don't forward it.",
    }),
  };
}

export async function sendInviteEmail(
  input: SendInviteEmailInput,
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return {
      success: false,
      error: "Email service is not configured. Set RESEND_API_KEY.",
    };
  }

  const templateId = getInviteTemplateId();
  const explicitFrom = getFromAddress();

  if (templateId) {
    // Resend-hosted template path. Subject + from come from the template by
    // default; we pass `from` only when EMAIL_FROM is explicitly set so the
    // template's configured sender wins out of the box.
    const { error } = await resend.emails.send({
      ...(explicitFrom ? { from: explicitFrom } : {}),
      to: input.to,
      template: {
        id: templateId,
        variables: buildInviteTemplateVariables(input),
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const { subject, html } = renderInviteEmail(input);
  const { error } = await resend.emails.send({
    from: getDefaultFromAddress(),
    to: input.to,
    subject,
    html,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Review request email — "approve this post before it goes live"
// ---------------------------------------------------------------------------

export interface SendReviewRequestEmailInput {
  to: string;
  reviewerName: string | null;
  clientName: string;
  reviewUrl: string;
  caption: string;
  networks: string[];
  schedule: { date: string | null; time: string | null } | null;
}

export function buildReviewTemplateVariables(
  input: SendReviewRequestEmailInput,
): Record<string, string> {
  const networkList = formatNetworks(input.networks);
  // Truncate the caption to keep us inside Resend's 2,000-char variable cap
  // and to keep the email scannable.
  const captionPreview =
    input.caption.length > 280
      ? `${input.caption.slice(0, 277)}…`
      : input.caption;

  const scheduleDate = input.schedule?.date ?? "";
  const scheduleTime = input.schedule?.time ?? "";
  const scheduleLine =
    scheduleDate && scheduleTime
      ? `Planned to go live ${scheduleDate} at ${scheduleTime}.`
      : "";

  return {
    CUSTOMER_NAME: input.reviewerName?.trim() || "there",
    CLIENT_NAME: input.clientName,
    AGENCY_NAME: getAgencyName(),
    NETWORKS: networkList,
    REVIEW_URL: input.reviewUrl,
    CAPTION: captionPreview,
    SCHEDULE_DATE: scheduleDate,
    SCHEDULE_TIME: scheduleTime,
    SCHEDULE_LINE: scheduleLine,
  };
}

export function renderReviewRequestEmail(
  input: SendReviewRequestEmailInput,
): { subject: string; html: string } {
  const agencyName = getAgencyName();
  const networkList = formatNetworks(input.networks);
  const safeClient = escapeHtml(input.clientName);
  const safeAgency = escapeHtml(agencyName);
  const safeNetworks = escapeHtml(networkList);

  const subject = `${input.clientName} — new ${networkList} post ready for your review`;

  const previewCaption =
    input.caption.length > 280
      ? `${input.caption.slice(0, 277)}…`
      : input.caption;

  const scheduleHtml =
    input.schedule?.date && input.schedule?.time
      ? `
        <p style="font-size: 14px; color: #475569; margin: 4px 0 14px; line-height: 1.55;">
          Planned to go live <strong style="color: #0f172a;">${escapeHtml(input.schedule.date)} at ${escapeHtml(input.schedule.time)}</strong>.
        </p>
      `
      : "";

  const introHtml = `
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px; color: #334155;">
      ${safeAgency} has a new <strong>${safeNetworks}</strong> post lined up for <strong>${safeClient}</strong>.
      Take a look and let us know it's good to go — or send notes back if anything should change.
    </p>
    ${scheduleHtml}
  `;

  const highlightHtml = `
    <div style="border-left: 3px solid #0f172a; padding: 14px 18px; background-color: #f8fafc; border-radius: 4px; margin: 22px 0 6px;">
      <p style="font-size: 11px; color: #64748b; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700;">
        Draft caption
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap; color: #0f172a;">
        ${escapeHtml(previewCaption)}
      </p>
    </div>
  `;

  return {
    subject,
    html: renderEmailLayout({
      agencyName,
      title: `Your ${input.clientName} post is ready to review`,
      greeting: input.reviewerName ? `Hi ${input.reviewerName},` : "Hi,",
      introHtml,
      highlightHtml,
      bullets: {
        heading: "What you can do on the review page:",
        items: [
          `See the full ${safeNetworks} previews exactly as the post will appear.`,
          `Tap <strong>Approve</strong> to greenlight publishing — we'll take it from there.`,
          `Or tap <strong>Request changes</strong> and tell us what to tweak. We'll update it and circle back.`,
        ],
      },
      cta: { href: input.reviewUrl, label: "Review the post" },
      expiryNote: "This review link is unique to your business and expires in 7 days.",
    }),
  };
}

export async function sendReviewRequestEmail(
  input: SendReviewRequestEmailInput,
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return {
      success: false,
      error: "Email service is not configured. Set RESEND_API_KEY.",
    };
  }

  const templateId = getReviewTemplateId();
  const explicitFrom = getFromAddress();

  if (templateId) {
    const { error } = await resend.emails.send({
      ...(explicitFrom ? { from: explicitFrom } : {}),
      to: input.to,
      template: {
        id: templateId,
        variables: buildReviewTemplateVariables(input),
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const { subject, html } = renderReviewRequestEmail(input);
  const { error } = await resend.emails.send({
    from: getDefaultFromAddress(),
    to: input.to,
    subject,
    html,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
