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

export function normalizeFirestoreTimestamp(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  if (value === null || value === undefined) return null;

  if (typeof value === "object") {
    const candidate = value as {
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
      nanoseconds?: number;
      _nanoseconds?: number;
    };

    if (typeof candidate.toDate === "function") {
      try {
        return candidate.toDate().toISOString();
      } catch {
        return null;
      }
    }

    const seconds = typeof candidate.seconds === "number"
      ? candidate.seconds
      : typeof candidate._seconds === "number"
      ? candidate._seconds
      : null;
    const nanoseconds = typeof candidate.nanoseconds === "number"
      ? candidate.nanoseconds
      : typeof candidate._nanoseconds === "number"
      ? candidate._nanoseconds
      : 0;

    if (seconds !== null) {
      return new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000)).toISOString();
    }
  }

  return null;
}

interface MaybeFirestoreError {
  code?: number | string;
  message?: string;
  details?: string;
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
