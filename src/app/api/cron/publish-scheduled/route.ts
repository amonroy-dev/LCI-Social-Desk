import { NextResponse, type NextRequest } from "next/server";

import { publishScheduledPosts } from "@/lib/services/post-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron endpoint — runs every minute on Pro, hourly on Hobby.
 *
 * Vercel automatically sends:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Set CRON_SECRET in Vercel → Project Settings → Environment Variables.
 * Generate with:  openssl rand -hex 32
 *
 * To test locally:
 *   curl -X POST http://localhost:3000/api/cron/publish-scheduled \
 *     -H "Authorization: Bearer <your CRON_SECRET>"
 */
export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}

async function handler(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  // In production, always require the secret.
  // In development (no secret set), allow unauthenticated for easy testing.
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }

  try {
    const summary = await publishScheduledPosts();
    return NextResponse.json({
      ok: true,
      ...summary,
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[cron/publish-scheduled] Fatal error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
