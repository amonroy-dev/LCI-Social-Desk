import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/server";
import { saveDraft } from "@/lib/services/post-service";
import { requestReview } from "@/lib/services/review-service";
import type { SocialPostDraft } from "@/lib/types";

export const runtime = "nodejs";

interface RequestReviewBody {
  draft?: SocialPostDraft;
  reviewerEmail?: string | null;
  reviewerName?: string | null;
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

  // Persist the draft first so the review can read it back by id.
  const { draft: saved } = await saveDraft(body.draft);

  try {
    const result = await requestReview(
      {
        postId: saved.id,
        reviewerEmail: body.reviewerEmail ?? null,
        reviewerName: body.reviewerName ?? null,
      },
      session,
    );
    return NextResponse.json({
      review: result.review,
      token: result.token,
      url: result.url,
      draft: result.post,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not request review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
