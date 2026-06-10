import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  MessageSquareWarning,
  Send,
  ShieldCheck,
} from "lucide-react";

import { TopBar } from "@/components/shell/top-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientChip } from "@/features/publishing/components/client-switcher";
import { CopyLinkButton } from "@/features/approvals/copy-link-button";
import { requireSession } from "@/lib/auth/server";
import { loadClients } from "@/lib/services/client-service";
import { listPosts } from "@/lib/services/post-service";
import {
  listReviews,
  signReviewId,
} from "@/lib/services/review-service";
import { getAppBaseUrl } from "@/lib/services/invite-service";
import type {
  Client,
  PostReview,
  SocialPostDraft,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  await requireSession();

  const [reviews, posts, clients] = await Promise.all([
    listReviews(),
    listPosts(),
    loadClients(),
  ]);

  const postsById = new Map<string, SocialPostDraft>(posts.map((p) => [p.id, p]));
  const clientsById = new Map<string, Client>(clients.map((c) => [c.id, c]));
  const baseUrl = getAppBaseUrl();

  const augmented = await Promise.all(
    reviews.map(async (review) => {
      const token = await signReviewId(review.id);
      return {
        review,
        token,
        url: `${baseUrl}/review/${token}`,
        post: postsById.get(review.postId) ?? null,
        client: clientsById.get(review.clientId) ?? null,
      };
    }),
  );

  const grouped = {
    pending: augmented.filter(
      (a) => a.review.status === "pending" || a.review.status === "opened",
    ),
    approved: augmented.filter((a) => a.review.status === "approved"),
    changes: augmented.filter((a) => a.review.status === "changes_requested"),
    other: augmented.filter(
      (a) =>
        a.review.status === "expired" || a.review.status === "revoked",
    ),
  };

  return (
    <>
      <TopBar
        title="Client approvals"
        subtitle="Track every post you've sent to a client for review."
      />
      <main className="flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--brand))]" />
                  How client approvals work
                </CardTitle>
                <Link
                  href="/dashboard/publishing/new"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--brand))] hover:underline"
                >
                  <Send className="h-3.5 w-3.5" /> New draft
                </Link>
              </div>
              <p className="text-[12px] text-muted-foreground">
                In the composer, click <span className="font-medium">Send for Approval</span>
                {" "}to mint a signed link unique to the client. They open it without
                signing in, see the same network previews you do, and either
                approve the post or send notes back. Every action is recorded in
                the audit log.
              </p>
            </CardHeader>
          </Card>

          <Section
            title="Awaiting client decision"
            tone="warning"
            icon={<Clock className="h-3.5 w-3.5" />}
            empty="Nothing is currently waiting on a client. Create a draft and send it for approval."
            items={grouped.pending}
          />

          <Section
            title="Approved"
            tone="success"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            empty="No approvals recorded yet."
            items={grouped.approved}
          />

          <Section
            title="Changes requested"
            tone="destructive"
            icon={<MessageSquareWarning className="h-3.5 w-3.5" />}
            empty="No change requests on file."
            items={grouped.changes}
          />

          {grouped.other.length > 0 ? (
            <Section
              title="Expired or revoked"
              tone="outline"
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              empty=""
              items={grouped.other}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}

function Section({
  title,
  tone,
  icon,
  empty,
  items,
}: {
  title: string;
  tone: "warning" | "success" | "destructive" | "outline";
  icon: React.ReactNode;
  empty: string;
  items: Array<{
    review: PostReview;
    url: string;
    post: SocialPostDraft | null;
    client: Client | null;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-[14px]">{title}</CardTitle>
          <Badge variant={tone} className="gap-1">
            {icon}
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">{empty}</p>
        ) : (
          items.map(({ review, url, post, client }) => (
            <ReviewRow
              key={review.id}
              review={review}
              url={url}
              post={post}
              client={client}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ReviewRow({
  review,
  url,
  post,
  client,
}: {
  review: PostReview;
  url: string;
  post: SocialPostDraft | null;
  client: Client | null;
}) {
  const lastDecision =
    review.history.length > 0 ? review.history[review.history.length - 1] : null;
  return (
    <div className="rounded-md border border-border bg-card/60 p-3.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {client ? <ClientChip client={client} /> : null}
            <div className="min-w-0">
              <div className="text-[13px] font-semibold tracking-tight text-foreground">
                {client?.name ?? review.clientId}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {review.reviewerName
                  ? `For ${review.reviewerName}`
                  : "Reviewer name not set"}
                {review.reviewerEmail ? ` · ${review.reviewerEmail}` : ""}
              </div>
            </div>
          </div>
          {post?.caption ? (
            <p className="mt-2 line-clamp-2 text-[12.5px] text-foreground/90">
              {post.caption}
            </p>
          ) : (
            <p className="mt-2 text-[12px] italic text-muted-foreground">
              (Draft has no caption.)
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              Requested {new Date(review.createdAt).toLocaleString()}
            </span>
            <span>
              Expires {new Date(review.expiresAt).toLocaleString()}
            </span>
            {review.openedAt ? (
              <span className="inline-flex items-center gap-1 text-foreground/80">
                <Eye className="h-3 w-3" /> Opened{" "}
                {new Date(review.openedAt).toLocaleString()}
              </span>
            ) : null}
            {post ? (
              <span>
                Networks: {post.networks.join(", ") || "—"}
              </span>
            ) : null}
          </div>
          {lastDecision?.comment ? (
            <p className="mt-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] text-foreground/90">
              <span className="font-medium">Client note: </span>
              {lastDecision.comment}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <ReviewBadge status={review.status} />
          <CopyLinkButton url={url} />
        </div>
      </div>
    </div>
  );
}

function ReviewBadge({ status }: { status: PostReview["status"] }) {
  switch (status) {
    case "approved":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
      );
    case "changes_requested":
      return (
        <Badge variant="destructive" className="gap-1">
          <MessageSquareWarning className="h-3 w-3" /> Changes requested
        </Badge>
      );
    case "opened":
      return (
        <Badge variant="warning" className="gap-1">
          <Eye className="h-3 w-3" /> Opened
        </Badge>
      );
    case "expired":
      return <Badge variant="outline">Expired</Badge>;
    case "revoked":
      return <Badge variant="outline">Revoked</Badge>;
    case "pending":
    default:
      return (
        <Badge variant="warning" className="gap-1">
          <ExternalLink className="h-3 w-3" /> Pending
        </Badge>
      );
  }
}
