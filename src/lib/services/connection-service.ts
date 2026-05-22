import "server-only";

import { connectionRepository } from "@/lib/repositories/connection-repository";
import { recordAudit } from "@/lib/services/audit-service";
import type {
  SocialConnection,
  SocialConnectionStatus,
  SupportedNetwork,
} from "@/lib/types";

interface UpsertConnectionInput {
  clientId: string;
  platform: SupportedNetwork;
  accountId: string | null;
  accountName: string | null;
  status: SocialConnectionStatus;
  scopes: string[];
  expiresAt: string | null;
  connectedBy: string | null;
  note?: string | null;
}

export async function upsertConnection(
  input: UpsertConnectionInput,
): Promise<SocialConnection> {
  const existing = await connectionRepository.get(input.clientId, input.platform);
  const now = new Date().toISOString();
  const wasReconnect = existing != null;
  const next: SocialConnection = {
    id: existing?.id ?? `conn_${Math.random().toString(36).slice(2, 12)}`,
    clientId: input.clientId,
    platform: input.platform,
    accountId: input.accountId,
    accountName: input.accountName,
    status: input.status,
    scopes: input.scopes,
    expiresAt: input.expiresAt,
    connectedBy: input.connectedBy,
    connectedAt: input.status === "connected" ? now : existing?.connectedAt ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishingReady:
      input.status === "connected" &&
      input.scopes.includes(
        input.platform === "facebook"
          ? "pages_manage_posts"
          : "instagram_content_publish",
      ),
    note: input.note ?? existing?.note ?? null,
  };

  await connectionRepository.upsert(next);

  await recordAudit({
    type:
      input.status === "connected"
        ? wasReconnect
          ? "connection.reconnected"
          : "connection.completed"
        : "connection.failed",
    message:
      input.status === "connected"
        ? `${input.platform} connection ${wasReconnect ? "renewed" : "completed"} for ${input.clientId}.`
        : `${input.platform} connection in state ${input.status} for ${input.clientId}.`,
    clientId: input.clientId,
    meta: { platform: input.platform, accountId: input.accountId },
  });

  return next;
}

export async function listConnectionsForClient(clientId: string) {
  return connectionRepository.listForClient(clientId);
}

export async function getConnection(
  clientId: string,
  platform: SupportedNetwork,
) {
  return connectionRepository.get(clientId, platform);
}

export async function markConnectionRevoked(
  clientId: string,
  platform: SupportedNetwork,
  reason?: string,
): Promise<SocialConnection | null> {
  const updated = await connectionRepository.patch(clientId, platform, {
    status: "revoked",
    publishingReady: false,
  });
  if (updated) {
    await recordAudit({
      type: "connection.disconnected",
      message: `${platform} connection revoked for ${clientId}${reason ? `: ${reason}` : ""}.`,
      clientId,
      meta: { platform },
    });
  }
  return updated;
}
