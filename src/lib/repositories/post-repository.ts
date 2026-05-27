import "server-only";

import type { SocialPostDraft } from "@/lib/types";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  classifyFirestoreError,
} from "@/lib/firebase/firestore-helpers";

/**
 * Repository for `socialPosts`. Uses Firestore when the admin SDK is
 * available; otherwise falls back to an in-memory map so the composer +
 * review workflow remains usable in local dev and unconfigured previews.
 *
 * The in-memory store is pinned to globalThis so it survives Next's dev-
 * mode module reloads and stays shared across server components + route
 * handlers (which otherwise compile into isolated module instances).
 */

const memory: Map<string, SocialPostDraft> = (() => {
  const g = globalThis as unknown as {
    __lciPostMemory?: Map<string, SocialPostDraft>;
  };
  if (!g.__lciPostMemory) g.__lciPostMemory = new Map();
  return g.__lciPostMemory;
})();

function toRecord(post: SocialPostDraft): Record<string, unknown> {
  return { ...post };
}

function fromDoc(id: string, data: Record<string, unknown>): SocialPostDraft {
  return {
    id,
    clientId: String(data.clientId ?? ""),
    networks: ((data.networks as SocialPostDraft["networks"]) ?? []) as SocialPostDraft["networks"],
    caption: String(data.caption ?? ""),
    firstComment: String(data.firstComment ?? ""),
    tags: ((data.tags as SocialPostDraft["tags"]) ?? []) as SocialPostDraft["tags"],
    media: ((data.media as SocialPostDraft["media"]) ?? []) as SocialPostDraft["media"],
    isDraft: Boolean(data.isDraft),
    schedule: (data.schedule as SocialPostDraft["schedule"]) ?? {
      date: null,
      time: null,
    },
    status: (data.status as SocialPostDraft["status"]) ?? "draft",
    updatedAt: String(data.updatedAt ?? ""),
    reviewId: (data.reviewId as string | null) ?? null,
    submittedForReviewAt: (data.submittedForReviewAt as string | null) ?? null,
    lastReviewDecision:
      (data.lastReviewDecision as SocialPostDraft["lastReviewDecision"]) ?? null,
  };
}

export const postRepository = {
  async upsert(post: SocialPostDraft): Promise<SocialPostDraft> {
    const db = getAdminFirestore();
    if (!db) {
      memory.set(post.id, post);
      return post;
    }
    try {
      await db
        .collection(COLLECTIONS.socialPosts)
        .doc(post.id)
        .set(toRecord(post), { merge: true });
      return post;
    } catch (err) {
      const e = classifyFirestoreError(err);
      throw new Error(`Could not save post (${e.kind}): ${e.message}`);
    }
  },

  async get(id: string): Promise<SocialPostDraft | null> {
    const db = getAdminFirestore();
    if (!db) return memory.get(id) ?? null;
    try {
      const snap = await db.collection(COLLECTIONS.socialPosts).doc(id).get();
      if (!snap.exists) return null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return null;
      throw new Error(`Could not load post (${e.kind}): ${e.message}`);
    }
  },

  async list(filters: {
    clientId?: string;
    statuses?: SocialPostDraft["status"][];
  } = {}): Promise<SocialPostDraft[]> {
    const db = getAdminFirestore();
    if (!db) {
      let all = Array.from(memory.values()).sort((a, b) =>
        a.updatedAt < b.updatedAt ? 1 : -1,
      );
      if (filters.clientId) all = all.filter((p) => p.clientId === filters.clientId);
      if (filters.statuses && filters.statuses.length) {
        const set = new Set(filters.statuses);
        all = all.filter((p) => set.has(p.status));
      }
      return all;
    }
    try {
      let query = db
        .collection(COLLECTIONS.socialPosts)
        .orderBy("updatedAt", "desc")
        .limit(200);
      if (filters.clientId) {
        query = db
          .collection(COLLECTIONS.socialPosts)
          .where("clientId", "==", filters.clientId)
          .orderBy("updatedAt", "desc")
          .limit(200);
      }
      const snap = await query.get();
      let rows = snap.docs.map((d) => fromDoc(d.id, d.data()));
      if (filters.statuses && filters.statuses.length) {
        const set = new Set(filters.statuses);
        rows = rows.filter((p) => set.has(p.status));
      }
      return rows;
    } catch (err) {
      const e = classifyFirestoreError(err);
      throw new Error(`Could not list posts (${e.kind}): ${e.message}`);
    }
  },

  async update(
    id: string,
    patch: Partial<SocialPostDraft>,
  ): Promise<SocialPostDraft | null> {
    const db = getAdminFirestore();
    if (!db) {
      const existing = memory.get(id);
      if (!existing) return null;
      const next = { ...existing, ...patch };
      memory.set(id, next);
      return next;
    }
    try {
      const ref = db.collection(COLLECTIONS.socialPosts).doc(id);
      await ref.set(patch as Record<string, unknown>, { merge: true });
      const snap = await ref.get();
      if (!snap.exists) return null;
      return fromDoc(snap.id, snap.data() ?? {});
    } catch (err) {
      const e = classifyFirestoreError(err);
      if (e.kind === "not-found") return null;
      throw new Error(`Could not update post (${e.kind}): ${e.message}`);
    }
  },
};
