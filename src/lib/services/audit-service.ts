import "server-only";

import type { AuditEventType, AuditLogEvent } from "@/lib/types";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  classifyFirestoreError,
} from "@/lib/firebase/firestore-helpers";

/**
 * Audit logging service. Writes to Firestore `auditLogs` when configured;
 * otherwise keeps the most recent events in memory so the service interface
 * stays consistent for callers regardless of environment.
 *
 * Audit writes are best-effort: a failure here must never break the user-
 * facing operation that triggered it. The error is logged in development and
 * the event is still kept in memory as a soft fallback so it can be
 * inspected if needed.
 */

const memory: AuditLogEvent[] = [];
const MAX_IN_MEMORY = 500;

export interface RecordAuditInput {
  type: AuditEventType;
  message: string;
  actorUid?: string | null;
  clientId?: string | null;
  meta?: Record<string, unknown>;
}

function buildEvent(input: RecordAuditInput): AuditLogEvent {
  return {
    id: `evt_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`,
    type: input.type,
    message: input.message,
    at: new Date().toISOString(),
    actorUid: input.actorUid ?? null,
    clientId: input.clientId ?? null,
    meta: input.meta,
  };
}

function pushMemory(event: AuditLogEvent) {
  memory.unshift(event);
  if (memory.length > MAX_IN_MEMORY) memory.length = MAX_IN_MEMORY;
}

export async function recordAudit(input: RecordAuditInput): Promise<AuditLogEvent> {
  const event = buildEvent(input);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info(`[audit] ${event.type} :: ${event.message}`);
  }

  pushMemory(event);

  const db = getAdminFirestore();
  if (!db) return event;

  try {
    await db
      .collection(COLLECTIONS.auditLogs)
      .doc(event.id)
      .set({ ...event });
  } catch (err) {
    classifyFirestoreError(err);
    // Swallow — audit failures should not bubble up into request flow.
    // The event still lives in `memory` for the lifetime of this server.
  }

  return event;
}

export interface ListAuditOptions {
  clientId?: string;
  limit?: number;
}

export async function listAuditEvents(
  options: ListAuditOptions = {},
): Promise<AuditLogEvent[]> {
  const limit = options.limit ?? 100;
  const db = getAdminFirestore();
  if (!db) {
    const filtered = options.clientId
      ? memory.filter((e) => e.clientId === options.clientId)
      : memory;
    return filtered.slice(0, limit);
  }
  try {
    let query = db
      .collection(COLLECTIONS.auditLogs)
      .orderBy("at", "desc")
      .limit(limit);
    if (options.clientId) {
      query = db
        .collection(COLLECTIONS.auditLogs)
        .where("clientId", "==", options.clientId)
        .orderBy("at", "desc")
        .limit(limit);
    }
    const snap = await query.get();
    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        message: data.message,
        at: data.at,
        actorUid: data.actorUid ?? null,
        clientId: data.clientId ?? null,
        meta: data.meta,
      };
    });
  } catch (err) {
    classifyFirestoreError(err);
    return [];
  }
}
