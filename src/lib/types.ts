export type NetworkId = "facebook" | "instagram" | "linkedin";

export type PostStatus =
  | "draft"
  | "pending_review"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "published"
  | "simulated";

export type AuditEventType =
  | "draft.created"
  | "draft.updated"
  | "draft.saved"
  | "post.scheduled"
  | "post.published"
  | "post.simulated"
  | "auth.signed_in"
  | "auth.signed_out"
  | "invite.created"
  | "invite.opened"
  | "invite.used"
  | "invite.expired"
  | "connection.started"
  | "connection.completed"
  | "connection.failed"
  | "connection.reconnected"
  | "connection.disconnected"
  | "review.requested"
  | "review.opened"
  | "review.approved"
  | "review.changes_requested";

export type AgencyRole = "owner" | "admin" | "member";

export interface AgencyUser {
  uid: string;
  fullName: string;
  email: string;
  role: AgencyRole;
  active: boolean;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp. */
  lastLoginAt: string | null;
  avatarUrl?: string | null;
}

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: AgencyRole;
  /** Whether this session was issued via demo mode (no Firebase). */
  demo?: boolean;
}

export interface Client {
  id: string;
  name: string;
  shortCode: string;
  industry: string;
  accent: string;
}

/** The two networks LCI Social Desk supports in this phase. LinkedIn is reserved. */
export type SupportedNetwork = "facebook" | "instagram";

export type SocialConnectionStatus =
  | "pending"
  | "connected"
  | "expired"
  | "revoked"
  | "error";

export interface SocialConnection {
  id: string;
  clientId: string;
  /** "facebook" or "instagram" — both flow through Meta OAuth. */
  platform: SupportedNetwork;
  /** Provider-side identifier (Page ID for FB, IG Business account ID). */
  accountId: string | null;
  accountName: string | null;
  status: SocialConnectionStatus;
  scopes: string[];
  /** uid of the agency user who initiated the connection (when known). */
  connectedBy: string | null;
  /** ISO timestamp set when status becomes "connected". */
  connectedAt: string | null;
  /** ISO timestamp for token expiry, when provided by Meta. */
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** True when scopes + token are sufficient to publish. */
  publishingReady: boolean;
  /** Internal note shown in the dashboard. */
  note?: string | null;
}

export type ClientInviteStatus = "pending" | "opened" | "used" | "expired" | "revoked";

export interface ClientInvite {
  id: string;
  clientId: string;
  /** Email of the client contact who should open the invite. Optional. */
  email: string | null;
  /** Display name of the client contact. Optional. */
  contactName: string | null;
  /** Networks the agency is asking the client to connect. */
  allowedNetworks: SupportedNetwork[];
  status: ClientInviteStatus;
  /** ISO timestamp. */
  expiresAt: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Agency user uid. */
  createdBy: string;
  /** ISO timestamp. */
  usedAt: string | null;
  /** ISO timestamp the link was first opened. */
  openedAt: string | null;
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  size: number;
  kind: "image" | "video";
}

export type ContentTag =
  | "Promo"
  | "Educational"
  | "Client Update"
  | "Seasonal"
  | "Urgent";

export interface ScheduleState {
  date: string | null;
  time: string | null;
}

export type ReviewDecision = "approved" | "changes_requested";

export interface ReviewDecisionRecord {
  decision: ReviewDecision;
  /** ISO timestamp the decision was recorded. */
  at: string;
  /** Display name the client entered when reviewing, when provided. */
  reviewerName: string | null;
  /** Optional comment included with the decision. */
  comment: string | null;
}

export type PostReviewStatus =
  | "pending"
  | "opened"
  | "approved"
  | "changes_requested"
  | "expired"
  | "revoked";

export interface PostReview {
  id: string;
  postId: string;
  clientId: string;
  /** Email of the client contact, when known. */
  reviewerEmail: string | null;
  /** Display name of the client contact, when known. */
  reviewerName: string | null;
  status: PostReviewStatus;
  /** ISO timestamp. */
  expiresAt: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Agency user uid who requested the review. */
  createdBy: string;
  /** ISO timestamp the link was first opened. */
  openedAt: string | null;
  /** ISO timestamp of the latest decision, when present. */
  decidedAt: string | null;
  /** Full ordered history of decisions (most recent last). */
  history: ReviewDecisionRecord[];
}

export interface SocialPostDraft {
  id: string;
  clientId: string;
  networks: NetworkId[];
  caption: string;
  firstComment: string;
  tags: ContentTag[];
  media: MediaAsset[];
  isDraft: boolean;
  schedule: ScheduleState;
  status: PostStatus;
  updatedAt: string;
  /** ID of the most recent PostReview for this draft, if any. */
  reviewId?: string | null;
  /** ISO timestamp the post entered pending_review, if applicable. */
  submittedForReviewAt?: string | null;
  /** Latest review decision, mirrored for fast composer reads. */
  lastReviewDecision?: ReviewDecisionRecord | null;
}

export interface AuditLogEvent {
  id: string;
  type: AuditEventType;
  message: string;
  /** ISO timestamp. */
  at: string;
  /** Actor uid, when known. */
  actorUid?: string | null;
  /** Optional client this event relates to. */
  clientId?: string | null;
  /** Arbitrary structured payload. */
  meta?: Record<string, unknown>;
}
