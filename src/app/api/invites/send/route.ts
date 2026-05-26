import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import { hasAtLeast } from "@/lib/auth/roles";
import { createInvite } from "@/lib/services/invite-service";
import { loadClient } from "@/lib/services/client-service";
import { sendInviteEmail, isEmailConfigured } from "@/lib/services/email-service";
import { recordAudit } from "@/lib/services/audit-service";
import type { SupportedNetwork } from "@/lib/types";

export const runtime = "nodejs";

interface SendInviteBody {
  clientId: string;
  email: string;
  contactName?: string | null;
  allowedNetworks?: SupportedNetwork[];
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAtLeast(session.role, "member")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email service is not configured. Set RESEND_API_KEY in environment variables." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Partial<SendInviteBody>;

  if (!body.clientId) {
    return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  }
  if (!body.email || !body.email.includes("@")) {
    return NextResponse.json({ error: "A valid email address is required to send the invite." }, { status: 400 });
  }

  const client = await loadClient(body.clientId);
  if (!client) {
    return NextResponse.json({ error: "Unknown client." }, { status: 404 });
  }

  const networks = body.allowedNetworks?.filter((n) =>
    ["facebook", "instagram"].includes(n),
  ) as SupportedNetwork[] | undefined;

  const result = await createInvite(
    {
      clientId: body.clientId,
      email: body.email,
      contactName: body.contactName ?? null,
      allowedNetworks: networks,
    },
    session,
  );

  const agencyName = process.env.NEXT_PUBLIC_AGENCY_NAME ?? "LCI";

  const emailResult = await sendInviteEmail({
    to: body.email,
    contactName: body.contactName ?? null,
    clientName: client.name,
    agencyName,
    inviteUrl: result.url,
    networks: result.invite.allowedNetworks,
  });

  if (!emailResult.success) {
    return NextResponse.json(
      {
        error: `Invite created but email failed: ${emailResult.error}`,
        invite: result.invite,
        url: result.url,
      },
      { status: 502 },
    );
  }

  await recordAudit({
    type: "invite.created",
    message: `Invite emailed to ${body.email} for ${client.name}.`,
    actorUid: session.uid,
    clientId: body.clientId,
    meta: { inviteId: result.invite.id, sentTo: body.email },
  });

  return NextResponse.json({
    ok: true,
    invite: result.invite,
    url: result.url,
    sentTo: body.email,
  });
}
