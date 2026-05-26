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
