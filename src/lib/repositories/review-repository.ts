import "server-only";

import type { PostReview } from "@/lib/types";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  classifyFirestoreError,
} from "@/lib/firebase/firestore-helpers";

/**
 * Repository for `postReviews` — client-facing approval requests sent for
 * a particular SocialPostDraft. Uses Firestore when available and falls
 * back to an in-memory map otherwise.
 *
 * The in-memory store is pinned to globalThis so it survives Next's dev-
 * mode module reloads and stays shared across server components + route
 * handlers (which otherwise compile into isolated module instances).
 */

const COLLECTION = "postReviews";

const memory: Map<string, PostReview> = (() => {
  const g = globalThis as unknown as {
    __lciReviewMemory?: Map<string, PostReview>;
  };
  if (!g.__lciReviewMemory) g.__lciReviewMemory = new Map();
  return g.__lciReviewMemory;
})();

function toRecord(review: PostReview): Record<string, unknown> {
  return { ...review };
}

function fromDoc(id: string, data: Record<string, unknown>): PostReview {
  return {
    id,
    postId: String(data.postId ?? ""),
    clientId: String(data.clientId ?? ""),
    reviewerEmail: (data.reviewerEmail as string | null) ?? null,
    reviewerName: (data.reviewerName as string | null) ?? null,
    status: (data.status as PostReview["status"]) ?? "pending",
    expiresAt: String(data.expiresAt ?? ""),
    createdAt: String(data.createdAt ?? ""),
    createdBy: String(data.createdBy ?? ""),
    openedAt: (data.openedAt as string | null) ?? null,
    decidedAt: (data.decidedAt as string | null) ?? null,
    history: ((data.history as PostReview["history"]) ?? []) as PostReview["history"],
  };
}

export const reviewRepository = {
  async create(review: PostReview): Promise<PostReview> {
    const db = getAdminFirestore();
    if (!db) {
      memory.set(review.id, review);
      return review;
    }
    try {
      await db.collection(COLLECTION).doc(review.id).set(toRecord(review));
      return review;
    } catch (err) {
      const e = classifyFirestoreError(err);
      throw new Error(`Could not save review (${e.kind}): ${e.message}`);
    }
  },

  async get(id: string): Promise<PostReview | null> {
    const db = getAdminFirestore();
    if (!db) return memory.get(id) ?? null;
    try {
      const snap = await db.collection(COLLECTION).doc(id).get();
      if (!snap.exists) return null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return null;
      throw new Error(`Could not load review (${e.kind}): ${e.message}`);
    }
  },

  async list(filters: { clientId?: string; postId?: string } = {}): Promise<PostReview[]> {
    const db = getAdminFirestore();
    if (!db) {
      let all = Array.from(memory.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1,
      );
      if (filters.clientId) all = all.filter((r) => r.clientId === filters.clientId);
      if (filters.postId) all = all.filter((r) => r.postId === filters.postId);
      return all;
    }
    try {
      let query = db.collection(COLLECTION).orderBy("createdAt", "desc").limit(200);
      if (filters.clientId) {
        query = db
          .collection(COLLECTION)
          .where("clientId", "==", filters.clientId)
          .orderBy("createdAt", "desc")
          .limit(200);
      }
      if (filters.postId) {
        query = db
          .collection(COLLECTION)
          .where("postId", "==", filters.postId)
          .orderBy("createdAt", "desc")
          .limit(200);
      }
      const snap = await query.get();
      return snap.docs.map((d) => fromDoc(d.id, d.data()));
    } catch (err) {
      const e = classifyFirestoreError(err);
      throw new Error(`Could not list reviews (${e.kind}): ${e.message}`);
    }
  },

  async update(
    id: string,
    patch: Partial<PostReview>,
  ): Promise<PostReview | null> {
    const db = getAdminFirestore();
    if (!db) {
      const existing = memory.get(id);
      if (!existing) return null;
      const next = { ...existing, ...patch };
      memory.set(id, next);
      return next;
    }
    try {
      const ref = db.collection(COLLECTION).doc(id);
      await ref.set(patch as Record<string, unknown>, { merge: true });
      const snap = await ref.get();
      if (!snap.exists) return null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return null;
      throw new Error(`Could not update review (${e.kind}): ${e.message}`);
    }
  },
};
