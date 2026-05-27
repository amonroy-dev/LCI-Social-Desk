import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import { schedulePost } from "@/lib/services/post-service";
import type { ScheduleState, SocialPostDraft } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    draft?: SocialPostDraft;
    schedule?: ScheduleState;
  };
  if (!body.draft || !body.schedule) {
    return NextResponse.json(
      { error: "draft and schedule are required" },
      { status: 400 },
    );
  }
  const result = await schedulePost(body.draft, body.schedule);
  return NextResponse.json(result);
}
