import { NextResponse, type NextRequest } from "next/server";

import { loadClient } from "@/lib/services/client-service";
import {
  exchangeCodeForTokens,
  readMetaConfig,
  verifyOAuthState,
} from "@/lib/services/meta-oauth";
import {
  markInviteStatus,
  resolveInviteToken,
} from "@/lib/services/invite-service";
import { inviteRepository } from "@/lib/repositories/invite-repository";
import { upsertConnection } from "@/lib/services/connection-service";
import { recordAudit } from "@/lib/services/audit-service";

export const runtime = "nodejs";

/**
 * Receives the OAuth code from Meta, validates state, exchanges the code,
 * persists socialConnection rows for the requested networks, and redirects
 * the client back to /connect/[token]?status=success|error.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (!state) {
    return new NextResponse("Missing state.", { status: 400 });
  }
  const verified = await verifyOAuthState(state);
  if (!verified) {
    return new NextResponse("OAuth state could not be verified.", { status: 400 });
  }

  const invite = await inviteRepository.get(verified.inviteId);
  if (!invite) {
    return new NextResponse("Invite not found.", { status: 404 });
  }

  if (error || !code) {
    await recordAudit({
      type: "connection.failed",
      message: `Meta OAuth failed for ${invite.clientId}: ${error ?? "no code"}`,
      clientId: invite.clientId,
    });
    return redirectToConnect(req, invite.id, "error");
  }

  const client = await loadClient(invite.clientId);
  const result = await exchangeCodeForTokens(code, client?.name ?? invite.clientId);

  const expiresAt = result.expiresInSeconds
    ? new Date(Date.now() + result.expiresInSeconds * 1000).toISOString()
    : null;

  for (const network of invite.allowedNetworks) {
    const matched = result.accounts.find((a) => a.platform === network);
    await upsertConnection({
      clientId: invite.clientId,
      platform: network,
      accountId: matched?.accountId ?? null,
      accountName: matched?.accountName ?? null,
      status: "connected",
      scopes: readMetaConfig()?.scopes ?? [
        "pages_show_list",
        "pages_manage_posts",
        "instagram_basic",
        "instagram_content_publish",
      ],
      expiresAt,
      connectedBy: invite.createdBy,
      note: result.simulated
        ? "Connected via simulated Meta OAuth — credentials not configured."
        : null,
    });
  }

  await markInviteStatus(invite.id, "used");

  const { signInviteId } = await import("@/lib/services/invite-service");
  const token = await signInviteId(invite.id);
  return redirectToConnect(req, token, "success");
}

function redirectToConnect(
  req: NextRequest,
  token: string,
  status: "success" | "error",
) {
  const url = new URL(`/connect/${token}`, req.nextUrl.origin);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url);
}

export const dynamic = "force-dynamic";

// Use of resolveInviteToken silences unused-import lint when present; we
// retain it for callers that need to re-validate after callback completion.
void resolveInviteToken;
