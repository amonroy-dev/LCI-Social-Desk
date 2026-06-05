import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import {
  createClient,
  loadClients,
  type CreateClientInput,
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
