import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import {
    COLLECTIONS,
    classifyFirestoreError,
    normalizeFirestoreTimestamp,
} from "@/lib/firebase/firestore-helpers";
import type { ClientInvite } from "@/lib/types";

/**
 * Repository for clientInvites. Reads/writes Firestore when the admin SDK is
 * configured; otherwise falls back to an in-memory map so local dev and demo
 * deployments still work.
 */

const memory = new Map<string, ClientInvite>();

function toRecord(invite: ClientInvite): Record<string, unknown> {
  return { ...invite };
}

function fromDoc(id: string, data: Record<string, unknown>): ClientInvite {
  return {
    id,
    clientId: String(data.clientId ?? ""),
    email: (data.email as string | null) ?? null,
    contactName: (data.contactName as string | null) ?? null,
    allowedNetworks: ((data.allowedNetworks as string[] | undefined) ?? []) as ClientInvite["allowedNetworks"],
    status: (data.status as ClientInvite["status"]) ?? "pending",
    expiresAt: normalizeFirestoreTimestamp(data.expiresAt) ?? "",
    createdAt: normalizeFirestoreTimestamp(data.createdAt) ?? "",
    createdBy: String(data.createdBy ?? ""),
    usedAt: normalizeFirestoreTimestamp(data.usedAt),
    openedAt: normalizeFirestoreTimestamp(data.openedAt),
  };
}

export const inviteRepository = {
  async create(invite: ClientInvite): Promise<ClientInvite> {
    const db = getAdminFirestore();
    if (!db) {
      memory.set(invite.id, invite);
      return invite;
    }
    try {
      await db
        .collection(COLLECTIONS.clientInvites)
        .doc(invite.id)
        .set(toRecord(invite));
      return invite;
    } catch (err) {
      const e = classifyFirestoreError(err);
      throw new Error(`Could not save invite (${e.kind}): ${e.message}`);
    }
  },

  async get(id: string): Promise<ClientInvite | null> {
    const db = getAdminFirestore();
    if (!db) return memory.get(id) ?? null;
    try {
      const snap = await db.collection(COLLECTIONS.clientInvites).doc(id).get();
      if (!snap.exists) return memory.get(id) ?? null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      // eslint-disable-next-line no-console
      console.warn(
        `[invites] get(${id}) failed: ${e.kind} ${e.message} — falling back to in-memory`,
      );
      return memory.get(id) ?? null;
    }
  },

  async list(clientId?: string): Promise<ClientInvite[]> {
    const db = getAdminFirestore();
    if (!db) {
      const all = Array.from(memory.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1,
      );
      return clientId ? all.filter((i) => i.clientId === clientId) : all;
    }
    try {
      let query = db
        .collection(COLLECTIONS.clientInvites)
        .orderBy("createdAt", "desc")
        .limit(200);
      if (clientId) {
        query = db
          .collection(COLLECTIONS.clientInvites)
          .where("clientId", "==", clientId)
          .orderBy("createdAt", "desc")
          .limit(200);
      }
      const snap = await query.get();
      return snap.docs.map((d) => fromDoc(d.id, d.data()));
    } catch (err) {
      const e = classifyFirestoreError(err);
      // eslint-disable-next-line no-console
      console.warn(
        `[invites] list failed: ${e.kind} ${e.message} — falling back to in-memory`,
      );
      const all = Array.from(memory.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1,
      );
      return clientId ? all.filter((i) => i.clientId === clientId) : all;
    }
  },

  async update(
    id: string,
    patch: Partial<ClientInvite>,
  ): Promise<ClientInvite | null> {
    const db = getAdminFirestore();
    if (!db) {
      const existing = memory.get(id);
      if (!existing) return null;
      const next = { ...existing, ...patch };
      memory.set(id, next);
      return next;
    }
    try {
      const ref = db.collection(COLLECTIONS.clientInvites).doc(id);
      await ref.set(patch as Record<string, unknown>, { merge: true });
      const snap = await ref.get();
      if (!snap.exists) return null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return null;
      throw new Error(`Could not update invite (${e.kind}): ${e.message}`);
    }
  },
};
