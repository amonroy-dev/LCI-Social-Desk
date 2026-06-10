import "server-only";

import { resolveRoleForEmail } from "@/lib/auth/roles";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
    COLLECTIONS,
    classifyFirestoreError,
    normalizeFirestoreTimestamp,
} from "@/lib/firebase/firestore-helpers";
import type { AgencyRole, AgencyUser } from "@/lib/types";

/**
 * Reads and writes the `agencyMembers` Firestore collection.
 *
 * Documents are keyed by Firebase `uid` so role lookups are O(1) for the
 * authenticated user. A secondary `email` field allows email-based lookups
 * (useful for the env-allowlist bootstrap path before a uid is known).
 *
 * Falls back to the env allowlist (`AGENCY_OWNERS`, `AGENCY_ADMINS`) when:
 *   - Firestore admin is not configured (e.g. local dev / demo mode), OR
 *   - the lookup succeeds but no member document exists for this user yet
 *     (first-time sign-in bootstrap).
 */

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function fromDoc(uid: string, data: Record<string, unknown>): AgencyUser {
  return {
    uid,
    fullName: String(data.fullName ?? ""),
    email: normalizeEmail(String(data.email ?? "")),
    role: (data.role as AgencyRole) ?? "member",
    active: Boolean(data.active ?? true),
    createdAt: normalizeFirestoreTimestamp(data.createdAt) ?? new Date().toISOString(),
    lastLoginAt: normalizeFirestoreTimestamp(data.lastLoginAt),
    avatarUrl: (data.avatarUrl as string | null) ?? null,
  };
}

export async function getAgencyMemberByUid(
  uid: string,
): Promise<AgencyUser | null> {
  const db = getAdminFirestore();
  if (!db) return null;
  try {
    const snap = await db.collection(COLLECTIONS.agencyMembers).doc(uid).get();
    if (!snap.exists) return null;
    return fromDoc(snap.id, snap.data() ?? {});
  } catch (err) {
    const e = classifyFirestoreError(err);
    if (e.kind === "not-found") return null;
    throw new Error(`agencyMembers lookup failed (${e.kind}): ${e.message}`);
  }
}

export async function getAgencyMemberByEmail(
  email: string,
): Promise<AgencyUser | null> {
  const db = getAdminFirestore();
  if (!db) return null;
  try {
    const snap = await db
      .collection(COLLECTIONS.agencyMembers)
      .where("email", "==", normalizeEmail(email))
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return fromDoc(doc.id, doc.data());
  } catch (err) {
    classifyFirestoreError(err);
    return null;
  }
}

export interface UpsertAgencyMemberInput {
  uid: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

/**
 * Upserts an agencyMembers document for the signing-in user, returning the
 * resolved member record. New members get a role from `resolveRoleForEmail`
 * (env-based) so the very first owner can self-bootstrap. Existing members
 * keep the role already stored in Firestore.
 */
export async function upsertAgencyMemberOnSignIn(
  input: UpsertAgencyMemberInput,
): Promise<AgencyUser> {
  const db = getAdminFirestore();
  const nowIso = new Date().toISOString();
  const fallbackRole = resolveRoleForEmail(input.email);

  // No Firestore: synthesize an ephemeral member object from the env config.
  if (!db) {
    return {
      uid: input.uid,
      email: normalizeEmail(input.email),
      fullName: input.fullName,
      role: fallbackRole,
      active: true,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      avatarUrl: input.avatarUrl ?? null,
    };
  }

  const ref = db.collection(COLLECTIONS.agencyMembers).doc(input.uid);
  try {
    const snap = await ref.get();
    if (snap.exists) {
      const existing = fromDoc(snap.id, snap.data() ?? {});
      if (existing.active === false) {
        throw new Error("This agency member is deactivated.");
      }
      await ref.set(
        {
          email: normalizeEmail(input.email),
          fullName: input.fullName || existing.fullName,
          avatarUrl: input.avatarUrl ?? existing.avatarUrl ?? null,
          lastLoginAt: nowIso,
        },
        { merge: true },
      );
      return { ...existing, lastLoginAt: nowIso };
    }

    const created: AgencyUser = {
      uid: input.uid,
      email: normalizeEmail(input.email),
      fullName: input.fullName || normalizeEmail(input.email),
      role: fallbackRole,
      active: true,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      avatarUrl: input.avatarUrl ?? null,
    };
    await ref.set({ ...created });
    return created;
  } catch (err) {
    const e = classifyFirestoreError(err);
    // Surface permission errors clearly — these almost always mean security
    // rules are blocking the admin SDK (which shouldn't happen with a real
    // service account) or that the project id is wrong.
    if (e.kind === "permission") {
      throw new Error(
        "agencyMembers write was denied. Confirm the service account belongs to the same Firebase project and that Firestore is enabled.",
      );
    }
    throw new Error(`Could not record agency member (${e.kind}): ${e.message}`);
  }
}

/**
 * Returns the canonical role for a verified Firebase user. Used during the
 * /api/auth/session POST so the session cookie can be issued with the right
 * role on the very first sign-in.
 */
export async function resolveRoleForVerifiedUser(input: {
  uid: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}): Promise<AgencyRole> {
  // 1. Fast path: existing member document by uid.
  const byUid = await getAgencyMemberByUid(input.uid);
  if (byUid) return byUid.role;

  // 2. Email-based migration path: pre-provisioned member with no uid yet.
  const byEmail = await getAgencyMemberByEmail(input.email);
  if (byEmail && byEmail.uid !== input.uid) {
    // Promote the existing record to use the actual Firebase uid.
    const db = getAdminFirestore();
    if (db) {
      try {
        await db
          .collection(COLLECTIONS.agencyMembers)
          .doc(input.uid)
          .set({ ...byEmail, uid: input.uid });
        await db.collection(COLLECTIONS.agencyMembers).doc(byEmail.uid).delete().catch(() => undefined);
      } catch (err) {
        classifyFirestoreError(err);
      }
    }
    return byEmail.role;
  }

  // 3. No matching member — access is restricted to pre-provisioned accounts only.
  throw new Error("You are not authorized to access this workspace. Contact your administrator to be added.");
}
