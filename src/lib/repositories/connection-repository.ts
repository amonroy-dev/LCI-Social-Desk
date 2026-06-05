import "server-only";

import type { SocialConnection, SupportedNetwork } from "@/lib/types";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  classifyFirestoreError,
} from "@/lib/firebase/firestore-helpers";

/**
 * Repository for socialConnections. Stores at most one document per
 * (clientId, platform) pair. Falls back to an in-memory map when Firestore
 * admin is unavailable.
 */

const memory = new Map<string, SocialConnection>();

function keyFor(clientId: string, platform: SupportedNetwork) {
  return `${clientId}::${platform}`;
}

function docIdFor(clientId: string, platform: SupportedNetwork) {
  // Deterministic doc id makes upserts safe and avoids the read-modify-write
  // race that would happen with a random id keyed by (clientId, platform).
  return `${clientId}__${platform}`;
}

function fromDoc(
  id: string,
  data: Record<string, unknown>,
): SocialConnection {
  return {
    id,
    clientId: String(data.clientId ?? ""),
    platform: (data.platform as SupportedNetwork) ?? "facebook",
    accountId: (data.accountId as string | null) ?? null,
    accountName: (data.accountName as string | null) ?? null,
    status: (data.status as SocialConnection["status"]) ?? "pending",
    scopes: ((data.scopes as string[] | undefined) ?? []) as string[],
    connectedBy: (data.connectedBy as string | null) ?? null,
    connectedAt: (data.connectedAt as string | null) ?? null,
    expiresAt: (data.expiresAt as string | null) ?? null,
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
    publishingReady: Boolean(data.publishingReady ?? false),
    note: (data.note as string | null) ?? null,
  };
}

export const connectionRepository = {
  async get(
    clientId: string,
    platform: SupportedNetwork,
  ): Promise<SocialConnection | null> {
    const db = getAdminFirestore();
    if (!db) return memory.get(keyFor(clientId, platform)) ?? null;
    try {
      const snap = await db
        .collection(COLLECTIONS.socialConnections)
        .doc(docIdFor(clientId, platform))
        .get();
      if (!snap.exists) return null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      // Reads should never crash a server component — log and degrade.
      // eslint-disable-next-line no-console
      console.warn(
        `[connections] get(${clientId},${platform}) failed: ${e.kind} ${e.message}`,
      );
      return memory.get(keyFor(clientId, platform)) ?? null;
    }
  },

  async listForClient(clientId: string): Promise<SocialConnection[]> {
    const db = getAdminFirestore();
    if (!db) {
      return Array.from(memory.values()).filter((c) => c.clientId === clientId);
    }
    try {
      const snap = await db
        .collection(COLLECTIONS.socialConnections)
        .where("clientId", "==", clientId)
        .get();
      return snap.docs.map((d) => fromDoc(d.id, d.data()));
    } catch (err) {
      const e = classifyFirestoreError(err);
      // eslint-disable-next-line no-console
      console.warn(
        `[connections] listForClient(${clientId}) failed: ${e.kind} ${e.message} — falling back to in-memory`,
      );
      return Array.from(memory.values()).filter((c) => c.clientId === clientId);
    }
  },

  async upsert(connection: SocialConnection): Promise<SocialConnection> {
    const db = getAdminFirestore();
    if (!db) {
      memory.set(keyFor(connection.clientId, connection.platform), connection);
      return connection;
    }
    const docId = docIdFor(connection.clientId, connection.platform);
    const normalized: SocialConnection = { ...connection, id: docId };
    try {
      await db
        .collection(COLLECTIONS.socialConnections)
        .doc(docId)
        .set({ ...normalized });
      return normalized;
    } catch (err) {
      const e = classifyFirestoreError(err);
      throw new Error(`Could not save connection (${e.kind}): ${e.message}`);
    }
  },

  async patch(
    clientId: string,
    platform: SupportedNetwork,
    patch: Partial<SocialConnection>,
  ): Promise<SocialConnection | null> {
    const db = getAdminFirestore();
    if (!db) {
      const existing = memory.get(keyFor(clientId, platform));
      if (!existing) return null;
      const next: SocialConnection = {
        ...existing,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      memory.set(keyFor(clientId, platform), next);
      return next;
    }
    try {
      const ref = db.collection(COLLECTIONS.socialConnections).doc(docIdFor(clientId, platform));
      await ref.set(
        { ...patch, updatedAt: new Date().toISOString() } as Record<string, unknown>,
        { merge: true },
      );
      const snap = await ref.get();
      if (!snap.exists) return null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return null;
      throw new Error(`Could not update connection (${e.kind}): ${e.message}`);
    }
  },
};
