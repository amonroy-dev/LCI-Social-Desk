import type { AuditEventType, AuditLogEvent } from "@/lib/types";

/**
 * Audit logging service. In v1 events live in memory; the public signature is
 * shaped so it can be swapped for Firestore writes to `auditLogs` without
 * touching call sites.
 */

const events: AuditLogEvent[] = [];
const MAX_IN_MEMORY = 500;

export interface RecordAuditInput {
  type: AuditEventType;
  message: string;
  actorUid?: string | null;
  clientId?: string | null;
  meta?: Record<string, unknown>;
}

export async function recordAudit(input: RecordAuditInput): Promise<AuditLogEvent> {
  const event: AuditLogEvent = {
    id: `evt_${Math.random().toString(36).slice(2, 12)}`,
    type: input.type,
    message: input.message,
    at: new Date().toISOString(),
    actorUid: input.actorUid ?? null,
    clientId: input.clientId ?? null,
    meta: input.meta,
  };
  events.unshift(event);
  if (events.length > MAX_IN_MEMORY) events.length = MAX_IN_MEMORY;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info(`[audit] ${event.type} :: ${event.message}`);
  }
  return event;
}

export async function listAuditEvents(options: { clientId?: string; limit?: number } = {}) {
  const filtered = options.clientId
    ? events.filter((e) => e.clientId === options.clientId)
    : events;
  return filtered.slice(0, options.limit ?? 100);
}
