import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import { hasAtLeast } from "@/lib/auth/roles";
import { markConnectionRevoked } from "@/lib/services/connection-service";
import type { SupportedNetwork } from "@/lib/types";

export const runtime = "nodejs";

const SUPPORTED: SupportedNetwork[] = ["facebook", "instagram"];

interface RouteParams {
  params: Promise<{ clientId: string; platform: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAtLeast(session.role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clientId, platform } = await params;
  if (!SUPPORTED.includes(platform as SupportedNetwork)) {
    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  }

  const updated = await markConnectionRevoked(
    clientId,
    platform as SupportedNetwork,
    `Disconnected by ${session.email}`,
  );
  return NextResponse.json({ connection: updated });
}
