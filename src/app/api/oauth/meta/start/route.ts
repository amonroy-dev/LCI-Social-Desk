import { NextResponse, type NextRequest } from "next/server";

import {
  buildMetaAuthUrl,
  isMetaConfigured,
  readMetaConfig,
  signOAuthState,
} from "@/lib/services/meta-oauth";
import { resolveInviteToken } from "@/lib/services/invite-service";
import { recordAudit } from "@/lib/services/audit-service";

export const runtime = "nodejs";

/**
 * Starts the Meta OAuth handoff for a client connection invite.
 *
 * Query params:
 *   - token  (required): the invite token from /connect/[token]
 *
 * Behavior:
 *   - Validates the invite token and its status.
 *   - Builds a signed OAuth `state` parameter.
 *   - Redirects to Meta when META_APP_ID/SECRET are configured, otherwise
 *     bounces directly back to the callback with a "simulated" code so the
 *     end-to-end UX is exercisable without real credentials.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return badRequest("Missing token.");
  }
  const resolved = await resolveInviteToken(token);
  if (!resolved) {
    return badRequest("Invite not found.");
  }
  if (resolved.status !== "valid") {
    return badRequest(`Invite is ${resolved.status}.`);
  }

  const state = await signOAuthState({
    inviteId: resolved.invite.id,
    clientId: resolved.invite.clientId,
  });

  await recordAudit({
    type: "connection.started",
    message: `Meta OAuth started for ${resolved.invite.clientId}.`,
    clientId: resolved.invite.clientId,
    meta: { inviteId: resolved.invite.id },
  });

  if (isMetaConfigured()) {
    const config = readMetaConfig()!;
    return NextResponse.redirect(buildMetaAuthUrl({ state, config }));
  }

  // Simulated mode: bounce straight to our callback with a fake auth code so
  // the client experience completes end-to-end without real provider keys.
  const callback = new URL("/api/oauth/meta/callback", req.nextUrl.origin);
  callback.searchParams.set("code", `sim_${Math.random().toString(36).slice(2, 10)}`);
  callback.searchParams.set("state", state);
  return NextResponse.redirect(callback);
}

function badRequest(message: string) {
  return new NextResponse(message, { status: 400 });
}
