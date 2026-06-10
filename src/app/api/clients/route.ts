import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import {
  archiveClient,
  createClient,
  loadClients,
  updateClient,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/lib/services/client-service";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clients = await loadClients();
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<CreateClientInput>;
  if (!body.name || !body.name.trim()) {
    return NextResponse.json(
      { error: "Client name is required." },
      { status: 400 },
    );
  }

  try {
    const { client } = await createClient(
      {
        name: body.name,
        industry: body.industry ?? null,
        primaryContactName: body.primaryContactName ?? null,
        primaryContactEmail: body.primaryContactEmail ?? null,
        website: body.website ?? null,
        notes: body.notes ?? null,
        accent: body.accent ?? null,
      },
      session,
    );
    return NextResponse.json({ client });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not add client.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "Client ID is required." }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as Partial<UpdateClientInput>;
  try {
    const client = await updateClient(clientId, body);
    return NextResponse.json({ client });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update client.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

interface ArchiveClientBody {
  action?: "archive";
}

export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as ArchiveClientBody;
  if (body.action !== "archive") {
    return NextResponse.json(
      { error: "Missing or invalid action." },
      { status: 400 },
    );
  }

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json(
      { error: "Client ID is required." },
      { status: 400 },
    );
  }

  try {
    await archiveClient(clientId, session);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not archive client.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
