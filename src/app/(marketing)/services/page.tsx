import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Megaphone,
  MessageCircle,
  PenTool,
  Target,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services — LCI Marketing",
  description:
    "Full-service social media management: strategy, content creation, publishing, community management, analytics, and paid social advertising.",
};

const SERVICES = [
  {
    id: "management",
    icon: <Target className="h-7 w-7" />,
    title: "Social Media Strategy & Management",
    description:
      "We build and execute a custom social strategy aligned with your business goals. From audience research and competitive analysis to content pillars and posting cadence — we handle the thinking and the doing.",
    features: [
      "Custom strategy development and quarterly planning",
      "Audience research and persona mapping",
      "Competitive landscape analysis",
      "Platform-specific optimization",
      "Brand voice and messaging guidelines",
      "Monthly strategy reviews and pivots",
    ],
  },
  {
    id: "content",
    icon: <PenTool className="h-7 w-7" />,
    title: "Content Creation",
    description:
      "Scroll-stopping content designed for each platform. Our creative team produces on-brand graphics, short-form video, carousel posts, and compelling copy that connects with your audience.",
    features: [
      "Custom graphic design and brand templates",
      "Short-form video production (Reels, TikTok, Shorts)",
      "Carousel and infographic design",
      "Copywriting and caption strategy",
      "UGC curation and repurposing",
      "Content calendar management",
    ],
  },
  {
    id: "publishing",
    icon: <Calendar className="h-7 w-7" />,
    title: "Publishing & Scheduling",
    description:
      "Consistent, optimized posting through our proprietary publishing platform. We ensure your content reaches your audience at the right time, on the right platform, every time.",
    features: [
      "Proprietary publishing dashboard (LCI Social Desk)",
      "Optimal timing and frequency analysis",
      "Multi-platform scheduling and cross-posting",
      "Approval workflows for client review",
      "Hashtag strategy and optimization",
      "Holiday and event-based content planning",
    ],
  },
  {
    id: "community",
    icon: <MessageCircle className="h-7 w-7" />,
    title: "Community Management",
    description:
      "We engage with your audience in real time — responding to comments, managing DMs, and nurturing relationships that turn followers into loyal customers.",
    features: [
      "Real-time comment and DM management",
      "Brand mention monitoring and response",
      "Review management and reputation monitoring",
      "Crisis response and escalation protocols",
      "Influencer relationship building",
      "Community growth initiatives",
    ],
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-7 w-7" />,
    title: "Analytics & Reporting",
    description:
      "Clear, actionable reporting that shows exactly what's working. We track the metrics that matter and translate data into strategy improvements.",
    features: [
      "Monthly performance reports with executive summary",
      "Custom KPI tracking and goal measurement",
      "Audience growth and engagement analysis",
      "Content performance benchmarking",
      "Competitor tracking and share of voice",
      "ROI measurement and attribution",
    ],
  },
  {
    id: "paid",
    icon: <Megaphone className="h-7 w-7" />,
    title: "Paid Social Advertising",
    description:
      "Data-driven advertising campaigns across Facebook, Instagram, LinkedIn, and more. We maximize your ad spend with precise targeting, creative testing, and ongoing optimization.",
    features: [
      "Campaign strategy and audience targeting",
      "Ad creative design and copywriting",
      "A/B testing and performance optimization",
      "Budget management and ROAS tracking",
      "Retargeting and lookalike audiences",
      "Weekly performance reports",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[hsl(199,80%,97%)] via-white to-[hsl(220,16%,96%)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px]">
              Services built to{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(199,80%,50%)] bg-clip-text text-transparent">
                grow your brand
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              From strategy to execution, we provide everything your brand needs to build an engaged audience and drive measurable results on social media.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services list ── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="space-y-16 lg:space-y-24">
            {SERVICES.map((service, i) => (
              <div
                key={service.id}
                id={service.id}
                className="scroll-mt-24 grid items-start gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
                    {service.icon}
                  </div>
                  <h2 className="mb-3 text-[26px] font-bold tracking-tight text-foreground">
                    {service.title}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-6 lg:p-8">
                    <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                      What&apos;s included
                    </h3>
                    <ul className="space-y-3">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-[14px] text-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[hsl(var(--brand))]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[hsl(220,16%,96%)] py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
          <h2 className="text-[28px] font-bold tracking-tight text-foreground sm:text-[36px]">
            Not sure which services you need?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            Every brand is different. Let&apos;s talk about your goals and we&apos;ll recommend the perfect package.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-7 text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--brand))]/25 transition-all hover:bg-[hsl(var(--brand))]/90"
          >
            Get a free consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
