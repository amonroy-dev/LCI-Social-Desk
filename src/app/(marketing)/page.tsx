import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Globe,
  Instagram,
  Megaphone,
  MessageCircle,
  PenTool,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "LCI Marketing — Social Media Management Agency",
  description:
    "LCI Marketing is a boutique social media management agency. We help growing brands build a real presence on Facebook and Instagram — strategy, content, and transparent results.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(199,80%,97%)] via-white to-[hsl(220,16%,96%)]" />
        <div className="absolute -top-40 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-[hsl(var(--brand))]/[0.06] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 -z-10 h-[400px] w-[400px] rounded-full bg-[hsl(199,80%,90%)]/40 blur-3xl" />

        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--brand))]/20 bg-[hsl(var(--brand-soft))] px-4 py-1.5 text-[12.5px] font-medium text-[hsl(var(--brand))]">
              <Sparkles className="h-3.5 w-3.5" />
              Boutique social media management
            </div>
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[60px]">
              Social media management that actually{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(199,80%,50%)] bg-clip-text text-transparent">
                feels personal
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              We&apos;re a small agency that works closely with a select group of brands — building strategy, creating content, and managing your social presence like it&apos;s our own.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-7 text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--brand))]/25 transition-all hover:bg-[hsl(var(--brand))]/90 hover:shadow-xl hover:shadow-[hsl(var(--brand))]/30"
              >
                Start a conversation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-white px-7 text-[15px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                What we do
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platforms ribbon ── */}
      <section className="border-y border-border/60 bg-white/60">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <p className="mb-6 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            We manage your brand across every platform
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/60">
            {[
              { icon: <Globe className="h-6 w-6" />, name: "Facebook" },
              { icon: <Instagram className="h-6 w-6" />, name: "Instagram" },
              { icon: <MessageCircle className="h-6 w-6" />, name: "LinkedIn" },
              { icon: <Megaphone className="h-6 w-6" />, name: "TikTok" },
              { icon: <Target className="h-6 w-6" />, name: "X / Twitter" },
              { icon: <Zap className="h-6 w-6" />, name: "YouTube" },
            ].map(({ icon, name }) => (
              <div key={name} className="flex items-center gap-2 text-[14px] font-medium">
                {icon}
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services overview ── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-[32px] font-bold tracking-tight text-foreground sm:text-[38px]">
              Everything your brand needs to show up on social
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              From building a strategy to publishing content and reviewing what worked — we handle the full picture.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Target className="h-6 w-6" />,
                title: "Strategy & Planning",
                description: "We learn your brand, your audience, and your goals — then build a content strategy tailored to your business, not a template.",
              },
              {
                icon: <PenTool className="h-6 w-6" />,
                title: "Content Creation",
                description: "Graphics, captions, and short-form video concepts designed to stop the scroll and actually say something worth reading.",
              },
              {
                icon: <Calendar className="h-6 w-6" />,
                title: "Publishing & Scheduling",
                description: "Consistent posting across your channels, managed through our own platform. You approve everything before it goes live.",
              },
              {
                icon: <MessageCircle className="h-6 w-6" />,
                title: "Community Management",
                description: "We keep an eye on your comments and messages so your audience feels seen — and your brand looks responsive.",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Analytics & Reporting",
                description: "Straightforward reporting on what matters — reach, engagement, growth — with no vanity metrics dressed up as wins.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Direct Founder Access",
                description: "You work directly with us, not an account manager or junior coordinator. Every client gets our full attention.",
              },
            ].map(({ icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-7 transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-lg hover:shadow-[hsl(var(--brand))]/[0.06]"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))] transition-colors group-hover:bg-[hsl(var(--brand))] group-hover:text-white">
                  {icon}
                </div>
                <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[hsl(var(--brand))] hover:underline"
            >
              Explore all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why boutique ── */}
      <section className="border-y border-border/60 bg-[hsl(222,24%,10%)] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-[26px] font-bold tracking-tight text-white sm:text-[32px]">
              Why work with a small agency?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-white/50">
              There are real advantages to working with a team that stays small on purpose.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                heading: "You talk to the people doing the work",
                body: "No account managers relaying your feedback. You work directly with the founders.",
              },
              {
                heading: "We built our own platform",
                body: "LCI Social Desk is our proprietary tool for scheduling, client approvals, and connection management — built specifically for how we work.",
              },
              {
                heading: "Selective by design",
                body: "We take on a limited number of clients so we can give each one the attention it deserves.",
              },
              {
                heading: "No long-term lock-in",
                body: "We earn your business month to month. If we&apos;re not delivering value, you&apos;re not stuck.",
              },
            ].map(({ heading, body }) => (
              <div key={heading} className="flex flex-col gap-3">
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--brand))]" />
                <h3 className="text-[15px] font-semibold leading-snug text-white">
                  {heading}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-white/50">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-[32px] font-bold tracking-tight text-foreground sm:text-[38px]">
              How we work together
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              A simple, transparent process from onboarding to ongoing growth.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Discovery & strategy",
                description: "We learn your brand, audience, and goals. Then we build a custom strategy and content calendar tailored to your business — not a copy-paste from someone else's playbook.",
              },
              {
                step: "02",
                title: "Create & publish",
                description: "Our team creates and schedules content across your channels. You review and approve every post from a secure link — no extra logins — before anything goes live.",
              },
              {
                step: "03",
                title: "Review & refine",
                description: "We share clear reporting on what's working and what isn't. No spin. Then we adjust, test, and keep improving — month after month.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="relative rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-8">
                <span className="mb-4 block font-mono text-[40px] font-bold leading-none text-[hsl(var(--brand))]/15">
                  {step}
                </span>
                <h3 className="mb-2 text-[18px] font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meet the founders ── */}
      <section className="bg-[hsl(220,16%,96%)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-[32px] font-bold tracking-tight text-foreground sm:text-[38px]">
              Meet the founders
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              LCI is a two-person founding team. When you work with us, you work with us.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            {[
              {
                name: "Antonio Monroy",
                role: "Co-Founder",
                bio: "Antonio leads technology and product at LCI. He built LCI Social Desk — our proprietary management platform — and believes that great creative work is only as good as the systems behind it.",
              },
              {
                name: "Ryan Alexander",
                role: "Co-Founder",
                bio: "Ryan drives strategy and client relationships at LCI. He&apos;s obsessed with understanding what actually moves the needle for a brand and building the content plans that get it there.",
              },
            ].map(({ name, role, bio }) => (
              <div
                key={name}
                className="rounded-2xl border border-border/60 bg-white p-8 text-center"
              >
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
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(222,24%,10%)] to-[hsl(222,24%,16%)] px-8 py-16 text-center lg:px-16 lg:py-20">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[hsl(var(--brand))]/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[hsl(var(--brand))]/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-[28px] font-bold tracking-tight text-white sm:text-[36px]">
                Ready to build something real?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-white/60">
                We&apos;re accepting new clients. Let&apos;s have an honest conversation about your brand and whether we&apos;re the right fit for each other.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-7 text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--brand))]/25 transition-all hover:bg-[hsl(var(--brand))]/90"
                >
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
