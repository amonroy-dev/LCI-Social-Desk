import "server-only";

import { postRepository } from "@/lib/repositories/post-repository";
import { recordAudit } from "@/lib/services/audit-service";
import { publishPostToNetworks } from "@/lib/services/meta-publisher";
import type {
  AuditLogEvent,
  PostStatus,
  ScheduleState,
  SocialPostDraft,
} from "@/lib/types";

/**
 * Publishing service. Persists drafts to the post repository (Firestore or
 * in-memory fallback) so subsequent flows — namely client review/approval —
 * can read them back by id. Provider publish is still simulated unless
 * NEXT_PUBLIC_ENABLE_PROVIDER_PUBLISH=true.
 */

function ensureId(draft: SocialPostDraft): SocialPostDraft {
  if (draft.id && draft.id !== "draft_local") return draft;
  return {
    ...draft,
    id: `post_${Math.random().toString(36).slice(2, 12)}`,
  };
}

async function persist(
  draft: SocialPostDraft,
  patch: Partial<SocialPostDraft>,
): Promise<SocialPostDraft> {
  const next: SocialPostDraft = {
    ...draft,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await postRepository.upsert(next);
  return next;
}

export async function saveDraft(
  draft: SocialPostDraft,
): Promise<{ draft: SocialPostDraft; event: AuditLogEvent }> {
  const withId = ensureId(draft);
  const saved = await persist(withId, { status: "draft", isDraft: true });
  const event = await recordAudit({
    type: "draft.saved",
    message: `Draft saved for ${saved.clientId}.`,
    clientId: saved.clientId,
    meta: { postId: saved.id },
  });
  return { draft: saved, event };
}

export async function schedulePost(
  draft: SocialPostDraft,
  schedule: ScheduleState,
): Promise<{ draft: SocialPostDraft; event: AuditLogEvent }> {
  const withId = ensureId(draft);
  // Combine date + time into a UTC ISO string so the cron can query it
  const scheduledAt =
    schedule.date && schedule.time
      ? `${schedule.date}T${schedule.time}:00.000Z`
      : null;
  const saved = await persist(withId, {
    schedule,
    scheduledAt,
    status: "scheduled",
    isDraft: false,
  });
  const event = await recordAudit({
    type: "post.scheduled",
    message: `Scheduled for ${schedule.date} at ${schedule.time} UTC.`,
    clientId: saved.clientId,
    meta: { postId: saved.id, schedule, scheduledAt },
  });
  return { draft: saved, event };
}

export async function publishScheduledPosts(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{ postId: string; status: string; networks: string; error?: string }>;
}> {
  const due = await postRepository.listDueScheduled();
  let succeeded = 0;
  let failed = 0;
  const results: Array<{ postId: string; status: string; networks: string; error?: string }> = [];

  for (const post of due) {
    try {
      const networkResults = await publishPostToNetworks(post);
      const allSucceeded = networkResults.every((r) => r.success);
      const anySimulated = networkResults.some((r) => r.simulated);

      const newStatus: PostStatus = !allSucceeded
        ? "failed"
        : anySimulated
          ? "simulated"
          : "published";

      await postRepository.upsert({
        ...post,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      const auditType =
        newStatus === "published"
          ? "post.cron_published"
          : newStatus === "simulated"
            ? "post.simulated"
            : "post.failed";

      await recordAudit({
        type: auditType,
        message: `Cron: ${newStatus} to ${post.networks.join(", ")} for ${post.clientId}.`,
        clientId: post.clientId,
        meta: { postId: post.id, networkResults },
      });

      if (allSucceeded) succeeded++;
      else failed++;

      results.push({
        postId: post.id,
        status: newStatus,
        networks: post.networks.join(", "),
      });
    } catch (err) {
      failed++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      await postRepository
        .upsert({ ...post, status: "failed", updatedAt: new Date().toISOString() })
        .catch(() => undefined);
      await recordAudit({
        type: "post.failed",
        message: `Cron: unexpected error publishing ${post.id}: ${errorMsg}`,
        clientId: post.clientId,
        meta: { postId: post.id, error: errorMsg },
      }).catch(() => undefined);
      results.push({ postId: post.id, status: "failed", networks: post.networks.join(", "), error: errorMsg });
    }
  }

  return { processed: due.length, succeeded, failed, results };
}

export async function publishPost(
  draft: SocialPostDraft,
): Promise<{ draft: SocialPostDraft; event: AuditLogEvent }> {
  const withId = ensureId(draft);
  const status: PostStatus =
    process.env.NEXT_PUBLIC_ENABLE_PROVIDER_PUBLISH === "true"
      ? "published"
      : "simulated";
  const saved = await persist(withId, { status, isDraft: false });
  const event = await recordAudit({
    type: status === "published" ? "post.published" : "post.simulated",
    message:
      status === "published"
        ? `Post published to ${saved.networks.join(", ")}.`
        : `Simulated publish to ${saved.networks.join(", ")}.`,
    clientId: saved.clientId,
    meta: { postId: saved.id, networks: saved.networks },
  });
  return { draft: saved, event };
}

export async function getPost(id: string): Promise<SocialPostDraft | null> {
  return postRepository.get(id);
}

export async function deletePost(
  id: string,
): Promise<{ event: AuditLogEvent }> {
  const post = await postRepository.get(id);
  await postRepository.delete(id);
  const event = await recordAudit({
    type: "post.deleted",
    message: `Post ${id} deleted.`,
    clientId: post?.clientId,
    meta: { postId: id },
  });
  return { event };
}

export async function listPosts(filters: {
  clientId?: string;
  statuses?: SocialPostDraft["status"][];
} = {}): Promise<SocialPostDraft[]> {
  return postRepository.list(filters);
}
