export type NetworkId = "facebook" | "instagram" | "linkedin";

export type PostStatus = "draft" | "scheduled" | "published" | "simulated";

export type AuditEventType =
  | "draft.created"
  | "draft.updated"
  | "draft.saved"
  | "post.scheduled"
  | "post.published"
  | "post.simulated";

export interface Client {
  id: string;
  name: string;
  /** Short identifier shown in compact controls (e.g. "NSD"). */
  shortCode: string;
  /** Industry or vertical, used for internal context. */
  industry: string;
  /** Soft accent color (Tailwind class fragment) for the avatar chip. */
  accent: string;
}

export interface SocialConnection {
  id: string;
  clientId: string;
  network: NetworkId;
  /** Handle as it appears on the network (e.g. @northshore.dental). */
  handle: string;
  /** Display name that appears in previews. */
  displayName: string;
  /** Whether the connection is currently authorized for publishing. */
  connected: boolean;
}

export interface MediaAsset {
  id: string;
  /** Object URL or remote URL for preview rendering. */
  url: string;
  name: string;
  size: number;
  /** "image" | "video" — kept narrow for v1. */
  kind: "image" | "video";
}

export type ContentTag =
  | "Promo"
  | "Educational"
  | "Client Update"
  | "Seasonal"
  | "Urgent";

export interface ScheduleState {
  /** ISO date string (yyyy-mm-dd). */
  date: string | null;
  /** 24h time string (HH:mm). */
  time: string | null;
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
  /** ISO timestamp string. */
  updatedAt: string;
}

export interface AuditLogEvent {
  id: string;
  type: AuditEventType;
  message: string;
  /** ISO timestamp string. */
  at: string;
}
