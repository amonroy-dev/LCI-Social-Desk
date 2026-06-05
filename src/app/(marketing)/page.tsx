import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Globe,
  Instagram,
  Megaphone,
  MessageCircle,
  PenTool,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "LCI Marketing — Social Media Management Agency",
  description:
    "LCI Marketing is a full-service social media management agency. We help brands grow their presence across Facebook, Instagram, and beyond with strategy, content, and real results.",
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
              Full-service social media management
            </div>
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[60px]">
              Grow your brand with{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(199,80%,50%)] bg-clip-text text-transparent">
                social that works
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              We manage your social presence end-to-end — strategy, content creation, publishing, community management, and analytics — so you can focus on running your business.
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
                href="/results"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-white px-7 text-[15px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                See our results
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
              Everything your brand needs to thrive on social
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              We handle the full lifecycle — from strategy and content creation to publishing and performance analysis.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Target className="h-6 w-6" />,
                title: "Strategy & Planning",
                description: "Custom social strategies aligned with your business goals, audience insights, and competitive landscape.",
              },
              {
                icon: <PenTool className="h-6 w-6" />,
                title: "Content Creation",
                description: "Scroll-stopping graphics, videos, and copy crafted by our in-house creative team for every platform.",
              },
              {
                icon: <Calendar className="h-6 w-6" />,
                title: "Publishing & Scheduling",
                description: "Consistent, optimized posting across all your channels with our proprietary publishing tools.",
              },
              {
                icon: <MessageCircle className="h-6 w-6" />,
                title: "Community Management",
                description: "Real-time engagement with your audience — responding to comments, messages, and brand mentions.",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Analytics & Reporting",
                description: "Monthly reports with actionable insights, growth metrics, and clear ROI measurement.",
              },
              {
                icon: <Megaphone className="h-6 w-6" />,
                title: "Paid Social Advertising",
                description: "Data-driven ad campaigns on Facebook, Instagram, and more to amplify your reach and conversions.",
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

      {/* ── Stats ── */}
      <section className="border-y border-border/60 bg-[hsl(222,24%,10%)] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "50+", label: "Clients managed" },
              { value: "3M+", label: "Engagements driven" },
              { value: "250%", label: "Average growth in reach" },
              { value: "10+", label: "Years of experience" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-[42px] font-bold tracking-tight text-white">
                  {value}
                </div>
                <div className="mt-1 text-[14px] text-white/50">{label}</div>
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
                description: "We learn your brand, audience, and goals. Then we build a custom strategy and content calendar tailored to your business.",
              },
              {
                step: "02",
                title: "Create & publish",
                description: "Our team creates and schedules content across your channels. You review and approve every post from a secure link we email you — no extra logins — before anything goes live.",
              },
              {
                step: "03",
                title: "Analyze & grow",
                description: "We continuously optimize based on performance data, refining what works and scaling your results month over month.",
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

      {/* ── Testimonials ── */}
      <section className="bg-[hsl(220,16%,96%)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-[32px] font-bold tracking-tight text-foreground sm:text-[38px]">
              Trusted by brands that care about growth
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "LCI transformed our social presence. We went from posting randomly to having a real strategy that drives leads every month.",
                name: "Sarah Chen",
                role: "Marketing Director, Northshore Dental",
                stat: "312% increase in engagement",
              },
              {
                quote: "The team feels like an extension of ours. They understand our brand voice perfectly and the results speak for themselves.",
                name: "Marcus Rivera",
                role: "CEO, Rivera Home Designs",
                stat: "2.5x follower growth in 6 months",
              },
              {
                quote: "Their analytics and reporting gave us clarity we never had before. We finally know exactly what's working and why.",
                name: "Priya Nair",
                role: "Owner, Lotus Wellness Studio",
                stat: "40% reduction in cost per lead",
              },
            ].map(({ quote, name, role, stat }) => (
              <div
                key={name}
                className="flex flex-col rounded-2xl border border-border/60 bg-white p-7"
              >
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand-soft))] px-3 py-1 text-[11.5px] font-semibold text-[hsl(var(--brand))]">
                  <TrendingUp className="h-3 w-3" />
                  {stat}
                </div>
                <blockquote className="flex-1 text-[14.5px] leading-relaxed text-foreground">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--brand))]/10 font-semibold text-[hsl(var(--brand))] text-[13px]">
                    {name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">{name}</div>
                    <div className="text-[12px] text-muted-foreground">{role}</div>
                  </div>
                </div>
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
                Ready to grow your social presence?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-white/60">
                Let&apos;s talk about your goals and build a strategy that drives real results for your brand.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-7 text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--brand))]/25 transition-all hover:bg-[hsl(var(--brand))]/90"
                >
                  Get your free consultation
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
