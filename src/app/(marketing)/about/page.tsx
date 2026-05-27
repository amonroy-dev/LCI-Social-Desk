import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Lightbulb, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About — LCI Marketing",
  description:
    "Learn about LCI Marketing — a passionate team of social media strategists, creators, and analysts helping brands grow their online presence.",
};

const VALUES = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Transparency",
    description: "No vanity metrics. We report on what matters and give you an honest view of performance — the wins and the areas to improve.",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Strategy-first",
    description: "Every post, campaign, and interaction is rooted in strategy. We don't just create content — we create content that drives results.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Partnership",
    description: "We're an extension of your team. Your success is our success, and we're invested in the long-term growth of your brand.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Adaptability",
    description: "Social moves fast. We stay ahead of trends, algorithm changes, and platform updates so your brand is always positioned to win.",
  },
];

const TEAM = [
  {
    name: "Alexandra Monroy",
    role: "Founder & Creative Director",
    bio: "With over a decade in digital marketing, Alex founded LCI to help brands build genuine connections on social media.",
  },
  {
    name: "Jordan Ellis",
    role: "Head of Strategy",
    bio: "Former agency strategist at a top-10 firm. Jordan builds data-driven social strategies that translate to real business growth.",
  },
  {
    name: "Mia Takahashi",
    role: "Lead Content Creator",
    bio: "Award-winning designer and visual storyteller. Mia crafts the scroll-stopping content that sets our clients apart.",
  },
  {
    name: "Daniel Okafor",
    role: "Analytics & Paid Media Lead",
    bio: "Data nerd and performance marketer. Daniel turns numbers into insights and ad spend into measurable ROI.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[hsl(199,80%,97%)] via-white to-[hsl(220,16%,96%)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px]">
              A team that lives and breathes{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(199,80%,50%)] bg-clip-text text-transparent">
                social
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              We&apos;re strategists, creators, and analysts who are obsessed with helping brands build real audiences and drive real results.
            </p>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-[28px] font-bold tracking-tight text-foreground">
              Our story
            </h2>
            <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                LCI Marketing started with a simple frustration: too many businesses were either neglecting social media entirely or wasting resources on content that wasn&apos;t driving results. We saw an opportunity to change that.
              </p>
              <p>
                Founded in 2016, we built LCI on the principle that great social media management requires three things: deep strategy, exceptional creative, and relentless data-driven optimization. No shortcuts, no template-driven approaches — just thoughtful work tailored to each brand.
              </p>
              <p>
                Today, we manage social media for over 50 brands across healthcare, real estate, hospitality, professional services, and e-commerce. Our team has driven over 3 million engagements and helped clients see an average 250% increase in reach within their first year with us.
              </p>
              <p>
                We&apos;ve also built our own proprietary publishing platform — LCI Social Desk — to streamline how we collaborate with clients, schedule content, and manage social connections. It&apos;s the same tool our clients use to review and approve content before it goes live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-[hsl(220,16%,96%)] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="mb-12 text-center text-[28px] font-bold tracking-tight text-foreground sm:text-[34px]">
            What we stand for
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-border/60 bg-white p-7"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
                  {icon}
                </div>
                <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-[28px] font-bold tracking-tight text-foreground sm:text-[34px]">
              Meet the team
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground">
              Small team, big impact. Every client works directly with our senior team.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(({ name, role, bio }) => (
              <div key={name} className="rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--brand))]/10 text-[20px] font-bold text-[hsl(var(--brand))]">
                  {name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{name}</h3>
                <p className="mt-0.5 text-[12.5px] font-medium text-[hsl(var(--brand))]">{role}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[hsl(220,16%,96%)] py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
          <h2 className="text-[28px] font-bold tracking-tight text-foreground sm:text-[36px]">
            Want to work with us?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            We&apos;d love to hear about your brand and discuss how we can help you grow.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-7 text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--brand))]/25 transition-all hover:bg-[hsl(var(--brand))]/90"
          >
            Let&apos;s talk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
