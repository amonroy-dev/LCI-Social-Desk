import { NextResponse, type NextRequest } from "next/server";

import { hasAtLeast } from "@/lib/auth/roles";
import { getCurrentSession } from "@/lib/auth/server";
import {
  createInvite,
  listInvites,
  type CreateInviteInput,
} from "@/lib/services/invite-service";
import { loadClient } from "@/lib/services/client-service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clientId = req.nextUrl.searchParams.get("clientId") ?? undefined;
  const invites = await listInvites(clientId);
  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAtLeast(session.role, "member")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<CreateInviteInput>;
  if (!body.clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }
  if (!(await loadClient(body.clientId))) {
    return NextResponse.json({ error: "Unknown client" }, { status: 404 });
  }

  const result = await createInvite(
    {
      clientId: body.clientId,
      email: body.email ?? null,
      contactName: body.contactName ?? null,
      allowedNetworks: body.allowedNetworks?.filter((n) =>
        ["facebook", "instagram"].includes(n),
      ) as CreateInviteInput["allowedNetworks"],
    },
    session,
  );

  return NextResponse.json({
    invite: result.invite,
    token: result.token,
    url: result.url,
  });
}
