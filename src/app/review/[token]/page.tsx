import type { Metadata } from "next";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Lock,
  ShieldCheck,
  TimerOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NetworkIcon } from "@/components/network/network-icon";
import { FacebookPreview } from "@/features/publishing/components/preview/facebook-preview";
import { InstagramPreview } from "@/features/publishing/components/preview/instagram-preview";
import { LinkedInPreview } from "@/features/publishing/components/preview/linkedin-preview";
import { ReviewActions } from "@/features/review/review-actions";
import { loadClient } from "@/lib/services/client-service";
import {
  markReviewOpened,
  resolveReviewToken,
} from "@/lib/services/review-service";
import type { Client, NetworkId, PostReview } from "@/lib/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Review post — LCI Social Desk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: PageProps) {
  const { token } = await params;
  const resolved = await resolveReviewToken(token);

  if (!resolved) {
    return (
      <Shell>
        <StatusCard
          tone="invalid"
          title="Review link is not valid"
          message="This review link could not be verified. It may have been mistyped, modified, or never issued. Ask the LCI Social Desk team for a fresh link."
        />
      </Shell>
    );
  }

  if (resolved.status === "expired") {
    const client = (await loadClient(resolved.review.clientId)) ?? undefined;
    return (
      <Shell client={client}>
        <StatusCard
          tone="expired"
          title="This review link has expired"
          message="For security, review links expire after a short window. Reach out to your account manager and they can send a fresh one."
        />
      </Shell>
    );
  }

  if (resolved.status === "revoked") {
    const client = (await loadClient(resolved.review.clientId)) ?? undefined;
    return (
      <Shell client={client}>
        <StatusCard
          tone="invalid"
          title="This review link has been revoked"
          message="The LCI Social Desk team revoked this link. Contact your account manager for a new one."
        />
      </Shell>
    );
  }

  await markReviewOpened(resolved.review.id);

  const { review, post } = resolved;
  const client = (await loadClient(review.clientId)) ?? undefined;
  const isDecided =
    review.status === "approved" || review.status === "changes_requested";
  const lastDecision =
    review.history.length > 0 ? review.history[review.history.length - 1] : null;

  return (
    <Shell client={client}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" className="gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Secure Review Link
          </Badge>
          <ReviewStatusBadge status={review.status} />
        </div>

        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            {client ? `Review post for ${client.name}` : "Review proposed post"}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            The LCI Social Desk team has prepared the post below for your
            approval. Look it over and either approve it for publishing, or send
            notes back with the changes you&rsquo;d like.
          </p>
        </div>

        {post.schedule.date && post.schedule.time ? (
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[12px] text-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-[hsl(var(--brand))]" />
            Planned for {post.schedule.date} · {post.schedule.time}
          </div>
        ) : null}

        {client ? (
          <PostPreviews
            client={client}
            networks={post.networks}
            caption={post.caption}
            firstComment={post.firstComment}
            media={post.media}
          />
        ) : null}

        {post.firstComment.trim().length > 0 ? (
          <Card className="border-border/80 bg-muted/30 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              First comment
            </div>
            <p className="mt-1 whitespace-pre-wrap text-[13px] text-foreground">
              {post.firstComment}
            </p>
          </Card>
        ) : null}

        <ReviewActions
          token={resolved.token}
          initialReviewerName={review.reviewerName}
          status={review.status as "pending" | "opened" | "approved" | "changes_requested"}
          lastDecision={lastDecision}
        />

        {isDecided ? <PreviousDecisions review={review} /> : null}

        <SupportBlock />
      </div>
    </Shell>
  );
}

function PostPreviews({
  client,
  networks,
  caption,
  media,
}: {
  client: Client;
  networks: NetworkId[];
  caption: string;
  firstComment: string;
  media: import("@/lib/types").MediaAsset[];
}) {
  return (
    <div className="space-y-4">
      {networks.includes("facebook") ? (
        <PreviewBlock label="Facebook" networkId="facebook">
          <FacebookPreview client={client} caption={caption} media={media} />
        </PreviewBlock>
      ) : null}
      {networks.includes("instagram") ? (
        <PreviewBlock label="Instagram" networkId="instagram">
          <InstagramPreview client={client} caption={caption} media={media} />
        </PreviewBlock>
      ) : null}
      {networks.includes("linkedin") ? (
        <PreviewBlock label="LinkedIn" networkId="linkedin">
          <LinkedInPreview client={client} caption={caption} media={media} />
        </PreviewBlock>
      ) : null}
    </div>
  );
}

function PreviewBlock({
  label,
  networkId,
  children,
}: {
  label: string;
  networkId: NetworkId;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 px-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <NetworkIcon network={networkId} />
        {label}
      </div>
      {children}
    </div>
  );
}

function PreviousDecisions({ review }: { review: PostReview }) {
  if (review.history.length <= 1) return null;
  return (
    <Card className="border-border/60 bg-muted/30 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Review history
      </div>
      <ul className="mt-2 space-y-2 text-[12px]">
        {review.history
          .slice()
          .reverse()
          .map((rec, idx) => (
            <li
              key={`${rec.at}-${idx}`}
              className="rounded-md border border-border bg-card px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {rec.decision === "approved" ? "Approved" : "Changes requested"}
                  {rec.reviewerName ? ` · ${rec.reviewerName}` : ""}
                </span>
                <span className="text-muted-foreground">
                  {new Date(rec.at).toLocaleString()}
                </span>
              </div>
              {rec.comment ? (
                <p className="mt-1 text-foreground/80">{rec.comment}</p>
              ) : null}
            </li>
          ))}
      </ul>
    </Card>
  );
}

function ReviewStatusBadge({ status }: { status: PostReview["status"] }) {
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
          <AlertTriangle className="h-3 w-3" /> Changes requested
        </Badge>
      );
    case "opened":
      return <Badge variant="warning">Opened</Badge>;
    case "pending":
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function Shell({
  children,
  client,
}: {
  children: React.ReactNode;
  client?: Client | undefined;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))] md:border-b-0 md:border-r">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--brand))]/15 text-[hsl(var(--sidebar-accent))] ring-1 ring-[hsl(var(--brand))]/30">
              <span className="font-mono text-[11px] font-bold">LCI</span>
            </span>
            <div className="leading-tight">
              <div className="text-[12.5px] font-semibold tracking-tight text-white">
                LCI Social Desk
              </div>
              <div className="text-[10.5px] uppercase tracking-wider text-[hsl(var(--sidebar-muted))]">
                Client Review
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[11.5px] text-[hsl(var(--sidebar-muted))]">
            <Pillar
              icon={<Lock className="h-3 w-3" />}
              title="Private link"
              body="Unique to your business. Don't share — anyone with the link can approve."
            />
            <Pillar
              icon={<ShieldCheck className="h-3 w-3" />}
              title="No login required"
              body="Approve or send notes right in your browser. We log each action."
            />
            <Pillar
              icon={<TimerOff className="h-3 w-3" />}
              title="Time-limited"
              body="Links expire in 7 days. Ask your account manager for a fresh one."
            />
          </div>

          {client ? (
            <div className="mt-6 rounded-md border border-white/5 bg-white/5 p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-[hsl(var(--sidebar-muted))]">
                Reviewing for
              </div>
              <div className="mt-0.5 text-[12.5px] font-semibold tracking-tight text-white">
                {client.name}
              </div>
              <div className="text-[11px] text-[hsl(var(--sidebar-muted))]">
                {client.industry}
              </div>
            </div>
          ) : null}
        </aside>
        <section className="p-6 md:p-8">{children}</section>
      </div>
    </main>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--brand))]/15 text-[hsl(var(--sidebar-accent))]">
        {icon}
      </span>
      <div>
        <div className="text-[11.5px] font-semibold text-white">{title}</div>
        <div>{body}</div>
      </div>
    </div>
  );
}

function StatusCard({
  tone,
  title,
  message,
}: {
  tone: "expired" | "invalid";
  title: string;
  message: string;
}) {
  return (
    <Card
      className={
        tone === "expired"
          ? "border-amber-300 bg-amber-50"
          : "border-destructive/40 bg-destructive/5"
      }
    >
      <div className="flex items-start gap-3 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-foreground">
          {tone === "expired" ? (
            <TimerOff className="h-4 w-4 text-amber-700" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </span>
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-[12.5px] text-foreground/80">{message}</p>
        </div>
      </div>
    </Card>
  );
}

function SupportBlock() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@lci.agency";
  return (
    <div className="text-[11.5px] text-muted-foreground">
      Need help? Email{" "}
      <a
        href={`mailto:${supportEmail}`}
        className="font-medium text-[hsl(var(--brand))] hover:underline"
      >
        {supportEmail}
      </a>{" "}
      and the LCI Social Desk team will help you out. Do not share this link —
      it is unique to your business.
    </div>
  );
}
