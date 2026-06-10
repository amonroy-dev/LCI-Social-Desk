import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import { fetchMetaAnalytics } from "@/lib/services/analytics-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const clientId = searchParams.get("clientId");
  const year = parseInt(searchParams.get("year") ?? "", 10);
  const month = parseInt(searchParams.get("month") ?? "", 10);

  if (!clientId || !clientId.trim()) {
    return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  }
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: "Valid year and month (1-12) are required." }, { status: 400 });
  }

  try {
    const data = await fetchMetaAnalytics(clientId, year, month);
    if (!data) {
      return NextResponse.json(
        { error: "No connected accounts found for this client." },
        { status: 404 },
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch analytics.";
    console.error("[api/analytics] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
