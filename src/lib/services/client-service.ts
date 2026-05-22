import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  classifyFirestoreError,
} from "@/lib/firebase/firestore-helpers";
import { SAMPLE_CLIENTS, getClient as getSampleClient } from "@/lib/sample-data";
import type { Client } from "@/lib/types";

/**
 * Server-side client loader. Reads from Firestore `clients` when available
 * and falls back to the sample roster for unconfigured deployments. The
 * browser-side composer still imports SAMPLE_CLIENTS directly — only server
 * components and API routes go through this loader.
 */

function fromDoc(id: string, data: Record<string, unknown>): Client {
  return {
    id,
    name: String(data.name ?? id),
    shortCode: String(data.shortCode ?? id.slice(0, 2).toUpperCase()),
    industry: String(data.industry ?? ""),
    accent: String(data.accent ?? "bg-muted text-foreground"),
  };
}

export async function loadClient(clientId: string): Promise<Client | null> {
  const db = getAdminFirestore();
  if (!db) return getSampleClient(clientId) ?? null;
  try {
    const snap = await db.collection(COLLECTIONS.clients).doc(clientId).get();
    if (!snap.exists) {
      // Permit dev-time mixed mode: fall back to sample data so the demo
      // flow still has something to render before Firestore is seeded.
      return getSampleClient(clientId) ?? null;
    }
    return fromDoc(snap.id, snap.data() ?? {});
  } catch (err) {
    classifyFirestoreError(err);
    return getSampleClient(clientId) ?? null;
  }
}

export async function loadClients(): Promise<Client[]> {
  const db = getAdminFirestore();
  if (!db) return SAMPLE_CLIENTS;
  try {
    const snap = await db
      .collection(COLLECTIONS.clients)
      .orderBy("name")
      .limit(200)
      .get();
    if (snap.empty) return SAMPLE_CLIENTS;
    return snap.docs.map((d) => fromDoc(d.id, d.data()));
  } catch (err) {
    classifyFirestoreError(err);
    return SAMPLE_CLIENTS;
  }
}
