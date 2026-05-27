import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import { saveDraft } from "@/lib/services/post-service";
import type { SocialPostDraft } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { draft?: SocialPostDraft };
  if (!body.draft) {
    return NextResponse.json({ error: "draft is required" }, { status: 400 });
  }
  const result = await saveDraft(body.draft);
  return NextResponse.json(result);
}
