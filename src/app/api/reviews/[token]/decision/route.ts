import { NextResponse, type NextRequest } from "next/server";

import {
  resolveReviewToken,
  submitReviewDecision,
} from "@/lib/services/review-service";
import type { ReviewDecision } from "@/lib/types";

export const runtime = "nodejs";

interface DecisionBody {
  decision?: ReviewDecision;
  reviewerName?: string | null;
  comment?: string | null;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const resolved = await resolveReviewToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid review link." }, { status: 404 });
  }
  if (resolved.status !== "valid") {
    return NextResponse.json(
      { error: `This review link is ${resolved.status}.` },
      { status: 410 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as DecisionBody;
  if (body.decision !== "approved" && body.decision !== "changes_requested") {
    return NextResponse.json(
      { error: "decision must be 'approved' or 'changes_requested'." },
      { status: 400 },
    );
  }
  if (
    body.decision === "changes_requested" &&
    !body.comment?.trim()
  ) {
    return NextResponse.json(
      { error: "Please include a brief note about the requested changes." },
      { status: 400 },
    );
  }

  try {
    const result = await submitReviewDecision({
      reviewId: resolved.review.id,
      decision: body.decision,
      reviewerName: body.reviewerName ?? null,
      comment: body.comment ?? null,
    });
    return NextResponse.json({
      review: result.review,
      draft: result.post,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not submit decision.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
