import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  classifyFirestoreError,
  coerceToISOString,
} from "@/lib/firebase/firestore-helpers";
import { SAMPLE_CLIENTS } from "@/lib/sample-data";
import type { Client } from "@/lib/types";

/**
 * Repository for `clients`. Firestore-first with an in-memory fallback.
 *
 * The in-memory store is pinned to globalThis so it survives Next's
 * dev-mode module reloads and stays shared across server components +
 * route handlers. It's seeded with SAMPLE_CLIENTS on first read so a
 * fresh deployment (no Firestore configured, no clients added yet) still
 * has something to render.
 */

const memory: Map<string, Client> = (() => {
  const g = globalThis as unknown as {
    __lciClientMemory?: Map<string, Client>;
  };
  if (!g.__lciClientMemory) {
    const map = new Map<string, Client>();
    for (const c of SAMPLE_CLIENTS) map.set(c.id, c);
    g.__lciClientMemory = map;
  }
  return g.__lciClientMemory;
})();

function fromDoc(id: string, data: Record<string, unknown>): Client {
  return {
    id,
    name: String(data.name ?? id),
    shortCode: String(data.shortCode ?? id.slice(0, 2).toUpperCase()),
    industry: String(data.industry ?? ""),
    accent: String(data.accent ?? "bg-muted text-foreground"),
    primaryContactName: (data.primaryContactName as string | null) ?? null,
    primaryContactEmail: (data.primaryContactEmail as string | null) ?? null,
    website: (data.website as string | null) ?? null,
    notes: (data.notes as string | null) ?? null,
    createdAt: coerceToISOString(data.createdAt),
    createdBy: (data.createdBy as string | null) ?? null,
    archivedAt: coerceToISOString(data.archivedAt),
  };
}

function toRecord(client: Client): Record<string, unknown> {
  return { ...client };
}

export const clientRepository = {
  async get(id: string): Promise<Client | null> {
    const db = getAdminFirestore();
    if (!db) return memory.get(id) ?? null;
    try {
      const snap = await db.collection(COLLECTIONS.clients).doc(id).get();
      if (!snap.exists) return memory.get(id) ?? null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return memory.get(id) ?? null;
      // Fall back to memory on transient Firestore errors.
      return memory.get(id) ?? null;
    }
  },

  /**
   * Returns active (non-archived) clients sorted by name.
   *
   * Firestore mode:
   *   - If the collection has any docs, return them.
   *   - If empty, fall back to the sample roster so a fresh deployment has
   *     something to show until the agency adds their first real client.
   * In-memory mode:
   *   - Return everything in the (sample-seeded) map.
   */
  async list(): Promise<Client[]> {
    const db = getAdminFirestore();
    if (!db) {
      return Array.from(memory.values())
        .filter((c) => !c.archivedAt)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    try {
      const snap = await db
        .collection(COLLECTIONS.clients)
        .orderBy("name")
        .limit(500)
        .get();
      if (snap.empty) return [...SAMPLE_CLIENTS];
      return snap.docs
        .map((d) => fromDoc(d.id, d.data()))
        .filter((c) => !c.archivedAt);
    } catch (err) {
      classifyFirestoreError(err);
      return [...SAMPLE_CLIENTS];
    }
  },

  /** Returns true if a client with this id is already on file. */
  async exists(id: string): Promise<boolean> {
    const db = getAdminFirestore();
    if (!db) return memory.has(id);
    try {
      const snap = await db.collection(COLLECTIONS.clients).doc(id).get();
      return snap.exists;
    } catch (err) {
      classifyFirestoreError(err);
      return memory.has(id);
    }
  },

  async create(client: Client): Promise<Client> {
    const db = getAdminFirestore();
    if (!db) {
      memory.set(client.id, client);
      return client;
    }
    try {
      await db
        .collection(COLLECTIONS.clients)
        .doc(client.id)
        .set(toRecord(client));
      // Mirror to memory so subsequent in-process reads see it immediately
      // even if Firestore eventual consistency lags on a follow-up request.
      memory.set(client.id, client);
      return client;
    } catch (err) {
      const e = classifyFirestoreError(err);
      throw new Error(`Could not save client (${e.kind}): ${e.message}`);
    }
  },

  async update(
    id: string,
    patch: Partial<Client>,
  ): Promise<Client | null> {
    const db = getAdminFirestore();
    if (!db) {
      const existing = memory.get(id);
      if (!existing) return null;
      const next = { ...existing, ...patch };
      memory.set(id, next);
      return next;
    }
    try {
      const ref = db.collection(COLLECTIONS.clients).doc(id);
      await ref.set(patch as Record<string, unknown>, { merge: true });
      const snap = await ref.get();
      if (!snap.exists) return null;
      const next = fromDoc(snap.id, snap.data() ?? {});
      memory.set(id, next);
      return next;
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return null;
      throw new Error(`Could not update client (${e.kind}): ${e.message}`);
    }
  },
};
