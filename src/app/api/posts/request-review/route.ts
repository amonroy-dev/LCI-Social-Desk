import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import { loadClient } from "@/lib/services/client-service";
import { saveDraft } from "@/lib/services/post-service";
import { requestReview } from "@/lib/services/review-service";
import {
  isEmailConfigured,
  sendReviewRequestEmail,
} from "@/lib/services/email-service";
import { recordAudit } from "@/lib/services/audit-service";
import type { SocialPostDraft } from "@/lib/types";

export const runtime = "nodejs";

interface RequestReviewBody {
  draft?: SocialPostDraft;
  reviewerEmail?: string | null;
  reviewerName?: string | null;
  /** When true, the server will also email the reviewer the link via Resend. */
  sendEmail?: boolean;
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as RequestReviewBody;
  if (!body.draft) {
    return NextResponse.json({ error: "draft is required" }, { status: 400 });
  }
  if (!body.draft.caption?.trim()) {
    return NextResponse.json(
      { error: "Add a caption before requesting client review." },
      { status: 400 },
    );
  }
  if (!body.draft.networks || body.draft.networks.length === 0) {
    return NextResponse.json(
      { error: "Select at least one network before requesting client review." },
      { status: 400 },
    );
  }

  const reviewerEmail = body.reviewerEmail?.trim() || null;

  if (body.sendEmail) {
    if (!reviewerEmail || !reviewerEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid reviewer email is required to send the review email." },
        { status: 400 },
      );
    }
    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          error:
            "Email service is not configured. Set RESEND_API_KEY in your environment to send review emails, or use Copy link instead.",
        },
        { status: 503 },
      );
    }
  }

  // Persist the draft first so the review can read it back by id.
  const { draft: saved } = await saveDraft(body.draft);

  try {
    const result = await requestReview(
      {
        postId: saved.id,
        reviewerEmail,
        reviewerName: body.reviewerName ?? null,
      },
      session,
    );

    let emailSentTo: string | null = null;
    let emailError: string | null = null;

    if (body.sendEmail && reviewerEmail) {
      const client = await loadClient(saved.clientId);
      const emailResult = await sendReviewRequestEmail({
        to: reviewerEmail,
        reviewerName: body.reviewerName ?? null,
        clientName: client?.name ?? saved.clientId,
        reviewUrl: result.url,
        caption: saved.caption,
        networks: saved.networks,
        schedule: saved.schedule,
      });
      if (emailResult.success) {
        emailSentTo = reviewerEmail;
        await recordAudit({
          type: "review.requested",
          message: `Review email sent to ${reviewerEmail} for ${client?.name ?? saved.clientId}.`,
          actorUid: session.uid,
          clientId: saved.clientId,
          meta: {
            reviewId: result.review.id,
            postId: saved.id,
            sentTo: reviewerEmail,
            channel: "email",
          },
        });
      } else {
        emailError = emailResult.error ?? "Email send failed.";
      }
    }

    return NextResponse.json({
      review: result.review,
      token: result.token,
      url: result.url,
      draft: result.post,
      sentTo: emailSentTo,
      emailError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not request review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
