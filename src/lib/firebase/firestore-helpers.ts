import "server-only";

export const COLLECTIONS = {
  agencyMembers: "agencyMembers",
  clientInvites: "clientInvites",
  socialConnections: "socialConnections",
  socialPosts: "socialPosts",
  mediaAssets: "mediaAssets",
  auditLogs: "auditLogs",
  clients: "clients",
} as const;

export class FirestoreUnavailableError extends Error {
  constructor(message = "Firestore admin client is not configured.") {
    super(message);
    this.name = "FirestoreUnavailableError";
  }
}

export class FirestorePermissionError extends Error {
  constructor(message = "Firestore returned a permission error.") {
    super(message);
    this.name = "FirestorePermissionError";
  }
}

interface MaybeFirestoreError {
  code?: number | string;
  message?: string;
  details?: string;
}

/**
 * Coerce a Firestore-shaped timestamp into a plain ISO string. The
 * firebase-admin SDK returns native `Timestamp` class instances when a doc
 * field was written with the Firestore Timestamp type (e.g. set via the
 * Firebase Console UI or by an earlier server-timestamp write). Passing
 * those through `Server Component -> Client Component` props throws:
 *   "Only plain objects ... can be passed to Client Components..."
 * because they're class instances, not POJOs.
 *
 * This helper accepts:
 *   - already-ISO strings (returned as-is)
 *   - native Date instances
 *   - millisecond epochs as numbers
 *   - firebase-admin Timestamp instances (`.toDate()` available)
 *   - serialized Timestamp shapes ({_seconds,_nanoseconds} or
 *     {seconds,nanoseconds})
 *   - null / undefined / unknown -> null
 */
export function coerceToISOString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isFinite(t) ? value.toISOString() : null;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d.toISOString() : null;
  }
  if (typeof value === "object") {
    const v = value as {
      toDate?: () => Date;
      _seconds?: unknown;
      _nanoseconds?: unknown;
      seconds?: unknown;
      nanoseconds?: unknown;
    };
    if (typeof v.toDate === "function") {
      try {
        const d = v.toDate();
        if (d instanceof Date && Number.isFinite(d.getTime())) {
          return d.toISOString();
        }
      } catch {
        // Fall through to manual seconds/nanos read below.
      }
    }
    const sec = v._seconds ?? v.seconds;
    const ns = v._nanoseconds ?? v.nanoseconds ?? 0;
    if (typeof sec === "number" && typeof ns === "number") {
      const ms = sec * 1000 + Math.floor(ns / 1e6);
      const d = new Date(ms);
      return Number.isFinite(d.getTime()) ? d.toISOString() : null;
    }
  }
  return null;
}

/**
 * Normalizes errors thrown by firebase-admin/firestore into the categories the
 * services care about. Logs the raw error in development for visibility and
 * returns a sentinel that callers can branch on without leaking provider
 * implementation details into the UI.
 */
export function classifyFirestoreError(err: unknown): {
  kind: "unavailable" | "permission" | "not-found" | "unknown";
  message: string;
  raw: unknown;
} {
  const e = err as MaybeFirestoreError;
  const message = e?.message ?? "Unknown Firestore error.";
  const code = typeof e?.code === "number" ? e.code : null;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("[firestore]", message, e?.code ?? "");
  }

  // gRPC status codes: 5 NOT_FOUND, 7 PERMISSION_DENIED, 14 UNAVAILABLE,
  // 16 UNAUTHENTICATED. Strings can also be returned in newer SDKs.
  if (code === 7 || /PERMISSION_DENIED/i.test(message)) {
    return { kind: "permission", message, raw: err };
  }
  if (code === 5 || /NOT_FOUND/i.test(message)) {
    return { kind: "not-found", message, raw: err };
  }
  if (code === 14 || code === 16 || /UNAVAILABLE|UNAUTHENTICATED/i.test(message)) {
    return { kind: "unavailable", message, raw: err };
  }
  return { kind: "unknown", message, raw: err };
}
