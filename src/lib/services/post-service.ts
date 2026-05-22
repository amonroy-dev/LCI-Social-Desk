import type {
  AuditLogEvent,
  PostStatus,
  ScheduleState,
  SocialPostDraft,
} from "../types";

/**
 * Stubbed publishing service. Each function simulates a Firestore-backed call
 * with a small artificial delay so the UI can show realistic loading states.
 * Swap these implementations for Firestore reads/writes when the backend is
 * wired in — the public signatures and shapes are designed to remain stable.
 */

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

function makeAudit(
  type: AuditLogEvent["type"],
  message: string,
): AuditLogEvent {
  return {
    id: `evt_${Math.random().toString(36).slice(2, 10)}`,
    type,
    message,
    at: new Date().toISOString(),
  };
}

export async function saveDraft(
  draft: SocialPostDraft,
): Promise<{ draft: SocialPostDraft; event: AuditLogEvent }> {
  await wait();
  const saved: SocialPostDraft = {
    ...draft,
    status: "draft",
    isDraft: true,
    updatedAt: new Date().toISOString(),
  };
  return {
    draft: saved,
    event: makeAudit("draft.saved", `Draft saved for ${draft.clientId}.`),
  };
}

export async function schedulePost(
  draft: SocialPostDraft,
  schedule: ScheduleState,
): Promise<{ draft: SocialPostDraft; event: AuditLogEvent }> {
  await wait();
  const scheduled: SocialPostDraft = {
    ...draft,
    schedule,
    status: "scheduled",
    isDraft: false,
    updatedAt: new Date().toISOString(),
  };
  return {
    draft: scheduled,
    event: makeAudit(
      "post.scheduled",
      `Scheduled for ${schedule.date} at ${schedule.time}.`,
    ),
  };
}

export async function publishPost(
  draft: SocialPostDraft,
): Promise<{ draft: SocialPostDraft; event: AuditLogEvent }> {
  await wait(600);
  const status: PostStatus =
    process.env.NEXT_PUBLIC_ENABLE_PROVIDER_PUBLISH === "true"
      ? "published"
      : "simulated";
  const updated: SocialPostDraft = {
    ...draft,
    status,
    isDraft: false,
    updatedAt: new Date().toISOString(),
  };
  return {
    draft: updated,
    event: makeAudit(
      status === "published" ? "post.published" : "post.simulated",
      status === "published"
        ? `Post published to ${draft.networks.join(", ")}.`
        : `Simulated publish to ${draft.networks.join(", ")}.`,
    ),
  };
}
