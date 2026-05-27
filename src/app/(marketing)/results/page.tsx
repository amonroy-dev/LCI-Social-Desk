import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Results — LCI Marketing",
  description:
    "Real results from real clients. See how LCI Marketing has helped brands grow their social presence, engagement, and revenue.",
};

const CASE_STUDIES = [
  {
    client: "Northshore Dental",
    industry: "Healthcare",
    challenge: "Northshore Dental had minimal social presence and relied entirely on word-of-mouth referrals. They needed to reach new patients in their area and build trust through social proof.",
    solution: "We built a content strategy around patient education, behind-the-scenes team content, and community engagement. We paired organic social with targeted Facebook and Instagram ads to reach prospective patients within 15 miles.",
    results: [
      { metric: "312%", label: "increase in engagement" },
      { metric: "185%", label: "growth in followers" },
      { metric: "47", label: "new patient inquiries per month" },
      { metric: "3.2x", label: "return on ad spend" },
    ],
    quote: "LCI transformed our social presence. We went from posting randomly to having a real strategy that drives leads every month.",
    quotePerson: "Sarah Chen, Marketing Director",
  },
  {
    client: "Rivera Home Designs",
    industry: "Interior Design & Real Estate",
    challenge: "Rivera Home Designs had beautiful work but wasn't showcasing it effectively on social media. Their Instagram was inconsistent and their Facebook page was dormant.",
    solution: "We developed a visual-first content strategy centered on project reveals, design tips, and process videos. We implemented a consistent posting cadence across Instagram and Facebook with strategic Reels and carousel posts.",
    results: [
      { metric: "2.5x", label: "follower growth in 6 months" },
      { metric: "425%", label: "increase in profile visits" },
      { metric: "22", label: "inbound project leads per month" },
      { metric: "15K", label: "average Reel views" },
    ],
    quote: "The team feels like an extension of ours. They understand our brand voice perfectly and the results speak for themselves.",
    quotePerson: "Marcus Rivera, CEO",
  },
  {
    client: "Lotus Wellness Studio",
    industry: "Health & Wellness",
    challenge: "Lotus was spending heavily on Facebook ads with diminishing returns. Their organic content wasn't driving engagement, and they had no clear understanding of their audience demographics.",
    solution: "We overhauled their paid social strategy with precise audience targeting and creative testing. On the organic side, we shifted to community-driven content — member spotlights, wellness tips, and interactive stories that boosted engagement.",
    results: [
      { metric: "40%", label: "reduction in cost per lead" },
      { metric: "280%", label: "increase in story engagement" },
      { metric: "58%", label: "increase in class bookings" },
      { metric: "2.1x", label: "return on ad spend improvement" },
    ],
    quote: "Their analytics and reporting gave us clarity we never had before. We finally know exactly what's working and why.",
    quotePerson: "Priya Nair, Owner",
  },
  {
    client: "Beacon Financial Group",
    industry: "Financial Services",
    challenge: "As a financial services firm, Beacon faced strict compliance requirements and struggled to create social content that was both engaging and compliant. They had almost no social presence.",
    solution: "We developed a compliance-friendly content framework with pre-approved templates and messaging guidelines. Our content focused on financial literacy, team expertise, and community involvement — building trust without triggering compliance issues.",
    results: [
      { metric: "500+", label: "LinkedIn followers in 4 months" },
      { metric: "12x", label: "increase in post engagement" },
      { metric: "34", label: "qualified leads from social" },
      { metric: "8", label: "thought leadership articles published" },
    ],
    quote: "We thought social was impossible in our industry. LCI found a way to make it work within our compliance requirements and actually generate leads.",
    quotePerson: "David Park, Managing Partner",
  },
];

export default function ResultsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[hsl(199,80%,97%)] via-white to-[hsl(220,16%,96%)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px]">
              Real results from{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(199,80%,50%)] bg-clip-text text-transparent">
                real brands
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              We measure success by the growth we drive. Here&apos;s how we&apos;ve helped our clients build audiences and generate results that matter.
            </p>
          </div>
        </div>
      </section>

      {/* ── Case Studies ── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="space-y-16 lg:space-y-20">
            {CASE_STUDIES.map((cs) => (
              <div
                key={cs.client}
                className="overflow-hidden rounded-3xl border border-border/60 bg-[hsl(220,16%,98%)]"
              >
                <div className="p-8 lg:p-12">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="inline-flex rounded-full bg-[hsl(var(--brand-soft))] px-3 py-1 text-[12px] font-semibold text-[hsl(var(--brand))]">
                      {cs.industry}
                    </span>
                  </div>
                  <h2 className="mb-4 text-[26px] font-bold tracking-tight text-foreground lg:text-[30px]">
                    {cs.client}
                  </h2>

                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-5">
                      <div>
                        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                          The Challenge
                        </h3>
                        <p className="text-[14.5px] leading-relaxed text-foreground/80">
                          {cs.challenge}
                        </p>
                      </div>
                      <div>
                        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Our Approach
                        </h3>
                        <p className="text-[14.5px] leading-relaxed text-foreground/80">
                          {cs.solution}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        {cs.results.map(({ metric, label }) => (
                          <div
                            key={label}
                            className="rounded-xl border border-border/60 bg-white p-5"
                          >
                            <div className="flex items-center gap-1.5 text-[hsl(var(--brand))]">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-[28px] font-bold tracking-tight">
                                {metric}
                              </span>
                            </div>
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-xl border border-[hsl(var(--brand))]/20 bg-[hsl(var(--brand-soft))] p-5">
                        <blockquote className="text-[14px] italic leading-relaxed text-foreground">
                          &ldquo;{cs.quote}&rdquo;
                        </blockquote>
                        <p className="mt-3 text-[12.5px] font-medium text-[hsl(var(--brand))]">
                          — {cs.quotePerson}
                        </p>
                      </div>
                    </div>
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
            Ready to be our next success story?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            Let&apos;s talk about your brand and build a strategy that delivers real, measurable results.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-7 text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--brand))]/25 transition-all hover:bg-[hsl(var(--brand))]/90"
          >
            Get your free consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
