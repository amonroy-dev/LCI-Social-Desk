import "server-only";

import { reviewRepository } from "@/lib/repositories/review-repository";
import { postRepository } from "@/lib/repositories/post-repository";
import { recordAudit } from "@/lib/services/audit-service";
import { loadClient } from "@/lib/services/client-service";
import { getAppBaseUrl } from "@/lib/services/invite-service";
import type {
  PostReview,
  ReviewDecision,
  ReviewDecisionRecord,
  SessionUser,
  SocialPostDraft,
} from "@/lib/types";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ALG = { name: "HMAC", hash: "SHA-256" } as const;

function utf8(s: string) {
  return new TextEncoder().encode(s);
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  const base64 = Buffer.from(bin, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(s: string): ArrayBuffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const base64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const node = Buffer.from(base64, "base64");
  const out = new ArrayBuffer(node.byteLength);
  new Uint8Array(out).set(node);
  return out;
}

function getReviewSecret(): string {
  return (
    process.env.REVIEW_TOKEN_SECRET ??
    process.env.INVITE_TOKEN_SECRET ??
    process.env.SESSION_SECRET ??
    "lci-dev-review-secret-please-rotate"
  );
}

export async function signReviewId(id: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(getReviewSecret()),
    ALG,
    false,
    ["sign", "verify"],
  );
  const payloadB64 = base64UrlEncode(utf8(JSON.stringify({ id, k: "review" })));
  const sig = await crypto.subtle.sign(ALG, key, utf8(payloadB64));
  return `${payloadB64}.${base64UrlEncode(sig)}`;
}

async function verifyReviewToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      utf8(getReviewSecret()),
      ALG,
      false,
      ["sign", "verify"],
    );
    const ok = await crypto.subtle.verify(
      ALG,
      key,
      base64UrlDecode(sigB64),
      utf8(payloadB64),
    );
    if (!ok) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64)),
    );
    if (payload.k !== "review") return null;
    return typeof payload.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
}

export interface RequestReviewInput {
  postId: string;
  reviewerEmail?: string | null;
  reviewerName?: string | null;
  ttlMs?: number;
}

export interface CreatedReview {
  review: PostReview;
  token: string;
  /** Public URL the client should open. */
  url: string;
  post: SocialPostDraft;
}

export async function requestReview(
  input: RequestReviewInput,
  actor: SessionUser,
): Promise<CreatedReview> {
  const post = await postRepository.get(input.postId);
  if (!post) {
    throw new Error(`Unknown post: ${input.postId}`);
  }
  const client = await loadClient(post.clientId);
  if (!client) {
    throw new Error(`Unknown client for post: ${post.clientId}`);
  }
  if (!post.caption.trim()) {
    throw new Error("Add a caption before requesting client review.");
  }
  if (post.networks.length === 0) {
    throw new Error("Select at least one network before requesting client review.");
  }

  const now = new Date();
  const id = `rev_${Math.random().toString(36).slice(2, 12)}`;
  const review: PostReview = {
    id,
    postId: post.id,
    clientId: post.clientId,
    reviewerEmail: input.reviewerEmail?.trim() || null,
    reviewerName: input.reviewerName?.trim() || null,
    status: "pending",
    expiresAt: new Date(now.getTime() + (input.ttlMs ?? SEVEN_DAYS_MS)).toISOString(),
    createdAt: now.toISOString(),
    createdBy: actor.uid,
    openedAt: null,
    decidedAt: null,
    history: [],
  };

  await reviewRepository.create(review);

  const updatedPost = await postRepository.update(post.id, {
    status: "pending_review",
    isDraft: false,
    reviewId: id,
    submittedForReviewAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  const token = await signReviewId(id);
  const url = `${getAppBaseUrl()}/review/${token}`;

  await recordAudit({
    type: "review.requested",
    message: `Review requested for ${client.name} by ${actor.email}.`,
    actorUid: actor.uid,
    clientId: post.clientId,
    meta: { reviewId: id, postId: post.id, reviewerEmail: review.reviewerEmail },
  });

  return { review, token, url, post: updatedPost ?? post };
}

export interface ResolvedReview {
  review: PostReview;
  post: SocialPostDraft;
  status: "valid" | "expired" | "revoked" | "invalid";
  token: string;
}

export async function resolveReviewToken(
  token: string,
): Promise<ResolvedReview | null> {
  const id = await verifyReviewToken(token);
  if (!id) return null;
  const review = await reviewRepository.get(id);
  if (!review) return null;
  const post = await postRepository.get(review.postId);
  if (!post) return null;

  let status: ResolvedReview["status"];
  if (review.status === "revoked") status = "revoked";
  else if (new Date(review.expiresAt).getTime() < Date.now()) status = "expired";
  else status = "valid";

  return { review, post, status, token };
}

export async function markReviewOpened(reviewId: string): Promise<void> {
  const review = await reviewRepository.get(reviewId);
  if (!review || review.openedAt) return;
  const nextStatus =
    review.status === "pending" ? "opened" : review.status;
  await reviewRepository.update(reviewId, {
    openedAt: new Date().toISOString(),
    status: nextStatus,
  });
  await recordAudit({
    type: "review.opened",
    message: `Review ${reviewId} opened by client.`,
    clientId: review.clientId,
    meta: { reviewId, postId: review.postId },
  });
}

export interface SubmitDecisionInput {
  reviewId: string;
  decision: ReviewDecision;
  reviewerName?: string | null;
  comment?: string | null;
}

export async function submitReviewDecision(
  input: SubmitDecisionInput,
): Promise<{ review: PostReview; post: SocialPostDraft }> {
  const review = await reviewRepository.get(input.reviewId);
  if (!review) throw new Error("Review not found.");
  if (review.status === "revoked") {
    throw new Error("This review link has been revoked.");
  }
  if (new Date(review.expiresAt).getTime() < Date.now()) {
    throw new Error("This review link has expired.");
  }

  const post = await postRepository.get(review.postId);
  if (!post) throw new Error("The draft for this review no longer exists.");

  const now = new Date().toISOString();
  const record: ReviewDecisionRecord = {
    decision: input.decision,
    at: now,
    reviewerName: input.reviewerName?.trim() || review.reviewerName || null,
    comment: input.comment?.trim() || null,
  };

  const updatedReview = await reviewRepository.update(review.id, {
    status: input.decision === "approved" ? "approved" : "changes_requested",
    decidedAt: now,
    history: [...review.history, record],
  });

  const updatedPost = await postRepository.update(post.id, {
    status: input.decision === "approved" ? "approved" : "changes_requested",
    lastReviewDecision: record,
    updatedAt: now,
  });

  await recordAudit({
    type:
      input.decision === "approved"
        ? "review.approved"
        : "review.changes_requested",
    message:
      input.decision === "approved"
        ? `Client approved review ${review.id}.`
        : `Client requested changes on review ${review.id}.`,
    clientId: review.clientId,
    meta: {
      reviewId: review.id,
      postId: review.postId,
      reviewerName: record.reviewerName,
      hasComment: Boolean(record.comment),
    },
  });

  return {
    review: updatedReview ?? { ...review, history: [...review.history, record] },
    post: updatedPost ?? post,
  };
}

export async function listReviews(filters: { clientId?: string } = {}) {
  return reviewRepository.list(filters);
}

export async function getReviewById(id: string) {
  return reviewRepository.get(id);
}
