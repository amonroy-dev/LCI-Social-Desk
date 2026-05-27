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

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "LCI Social Desk <noreply@resend.dev>";
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

interface SendInviteEmailInput {
  to: string;
  contactName: string | null;
  clientName: string;
  agencyName: string;
  inviteUrl: string;
  networks: string[];
}

export async function sendInviteEmail(input: SendInviteEmailInput): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { success: false, error: "Email service is not configured. Set RESEND_API_KEY." };
  }

  const fromAddress = process.env.EMAIL_FROM ?? "LCI Social Desk <noreply@resend.dev>";
  const greeting = input.contactName ? `Hi ${input.contactName}` : "Hi";
  const networkList = input.networks.map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" and ");

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: input.to,
    subject: `Connect your ${networkList} — ${input.clientName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <p style="font-size: 15px; color: #1a1a1a; margin-bottom: 16px;">${greeting},</p>
        <p style="font-size: 15px; color: #1a1a1a; margin-bottom: 16px;">
          <strong>${input.agencyName}</strong> needs to connect your ${networkList} account${input.networks.length > 1 ? "s" : ""} for <strong>${input.clientName}</strong> so we can manage your social media publishing.
        </p>
        <p style="font-size: 15px; color: #1a1a1a; margin-bottom: 24px;">
          Click the button below to securely authorize access. No account or password is needed — just approve the connection through ${networkList}.
        </p>
        <a href="${input.inviteUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
          Connect ${networkList}
        </a>
        <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
          This link expires in 14 days. If you have questions, reply to this email or contact ${input.agencyName}.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;" />
        <p style="font-size: 11px; color: #9ca3af;">
          Sent via LCI Social Desk on behalf of ${input.agencyName}.
        </p>
      </div>
    `,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

interface SendReviewRequestEmailInput {
  to: string;
  reviewerName: string | null;
  clientName: string;
  reviewUrl: string;
  caption: string;
  networks: string[];
  schedule: { date: string | null; time: string | null } | null;
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

  const agencyName = getAgencyName();
  const greeting = input.reviewerName ? `Hi ${input.reviewerName}` : "Hi";
  const networkList = input.networks
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
    .join(" and ");
  const scheduleLine =
    input.schedule?.date && input.schedule?.time
      ? `Planned for <strong>${input.schedule.date} at ${input.schedule.time}</strong>.`
      : "";

  // Lightly truncate the caption for the email preview.
  const previewCaption =
    input.caption.length > 280
      ? `${input.caption.slice(0, 277)}…`
      : input.caption;

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: input.to,
    subject: `Review needed: ${input.clientName} ${networkList} post`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <p style="font-size: 15px; margin-bottom: 16px;">${greeting},</p>
        <p style="font-size: 15px; margin-bottom: 16px;">
          <strong>${agencyName}</strong> has a new ${networkList} post ready for
          <strong>${input.clientName}</strong> and would like your approval before it goes live.
        </p>
        ${scheduleLine ? `<p style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">${scheduleLine}</p>` : ""}
        <div style="border-left: 3px solid #2563eb; padding: 12px 16px; background-color: #f8fafc; border-radius: 4px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">Draft caption</p>
          <p style="font-size: 14px; line-height: 1.55; margin: 0; white-space: pre-wrap;">${escapeHtml(previewCaption)}</p>
        </div>
        <p style="font-size: 15px; margin-bottom: 24px;">
          Click below to see the full Facebook and Instagram previews and approve or request changes — no login required.
        </p>
        <a href="${input.reviewUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
          Review the post
        </a>
        <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
          This review link is unique to your business and expires in 7 days. If you have questions, just reply to this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;" />
        <p style="font-size: 11px; color: #9ca3af;">
          Sent via LCI Social Desk on behalf of ${agencyName}.
        </p>
      </div>
    `,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
