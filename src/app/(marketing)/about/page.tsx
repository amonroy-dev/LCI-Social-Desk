import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Lightbulb, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About — LCI Marketing",
  description:
    "LCI Marketing is a boutique social media agency founded by Antonio Monroy and Ryan Alexander. We work closely with a small number of brands to build a real social presence.",
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
    name: "Antonio Monroy",
    role: "Co-Founder",
    bio: "Antonio leads technology and product at LCI. He built LCI Social Desk — our proprietary scheduling and client management platform — and drives the systems that keep everything running smoothly. He believes good creative work lives or dies on the infrastructure behind it.",
  },
  {
    name: "Ryan Alexander",
    role: "Co-Founder",
    bio: "Ryan leads strategy and client relationships at LCI. He focuses on understanding what actually moves a brand forward — building content strategies rooted in the business goals behind them, not just aesthetics.",
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
              A small team with a{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(199,80%,50%)] bg-clip-text text-transparent">
                clear focus
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              We&apos;re a two-person founding team that works closely with a select group of brands. No layers, no hand-offs — just focused, personal social media management.
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
                LCI Marketing was founded in 2025 by Antonio Monroy and Ryan Alexander. We started with a simple observation: most small and mid-sized businesses either ignore social media entirely, or they hand it off to someone without a real strategy — and then wonder why it isn&apos;t working.
              </p>
              <p>
                We built LCI to do it differently. Small enough to give every client real attention. Focused enough to actually know what we&apos;re doing. And honest enough to tell you when something isn&apos;t working and course-correct fast.
              </p>
              <p>
                One of the things we&apos;re most proud of is building our own platform — LCI Social Desk. It&apos;s the tool we use to manage scheduling, client approvals, and social connections. When you work with us, you get a direct link to review and approve posts before they go live. No logins, no friction — just a simple link in your inbox.
              </p>
              <p>
                We&apos;re early in our journey and we&apos;re intentional about who we take on. If you want a partner who&apos;s invested in your brand — not just your invoice — let&apos;s talk.
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
              The founders
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground">
              Two co-founders. When you hire LCI, you work directly with both of us.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            {TEAM.map(({ name, role, bio }) => (
              <div key={name} className="rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--brand))]/10 text-[20px] font-bold text-[hsl(var(--brand))]">
                  {name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="text-[16px] font-semibold text-foreground">{name}</h3>
                <p className="mt-0.5 text-[12.5px] font-medium text-[hsl(var(--brand))]">{role}</p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">{bio}</p>
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
            We&apos;re accepting new clients. Let&apos;s have an honest conversation about your brand and figure out if we&apos;re the right fit.
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
