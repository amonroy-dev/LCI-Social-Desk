"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [pending, setPending] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPending(false);
    setSubmitted(true);
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[hsl(199,80%,97%)] via-white to-[hsl(220,16%,96%)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px]">
              Let&apos;s{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(199,80%,50%)] bg-clip-text text-transparent">
                start growing
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Tell us about your brand and goals. We&apos;ll get back to you within 24 hours with ideas for how we can help.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact form + info ── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/60 p-12 text-center">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-600" />
                  <h2 className="text-[22px] font-bold tracking-tight text-foreground">
                    Thanks for reaching out!
                  </h2>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    We&apos;ll review your message and get back to you within 24 hours. We&apos;re excited to learn about your brand.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Jane Smith"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Work email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jane@company.com"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="company">Company / brand</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Acme Inc."
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="services">What services are you interested in?</Label>
                    <select
                      id="services"
                      name="services"
                      className="flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a service...</option>
                      <option value="management">Social Media Management</option>
                      <option value="content">Content Creation</option>
                      <option value="paid">Paid Social Advertising</option>
                      <option value="analytics">Analytics & Reporting</option>
                      <option value="full">Full-Service Package</option>
                      <option value="other">Other / Not sure yet</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Tell us about your goals *</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="What are you looking to achieve with social media? Any specific challenges or goals?"
                      required
                      className="flex w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-12 w-full rounded-xl bg-[hsl(var(--brand))] text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--brand))]/25 hover:bg-[hsl(var(--brand))]/90 sm:w-auto sm:px-8"
                  >
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Send message
                  </Button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-8 lg:col-span-2">
              <div className="rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-7">
                <h3 className="mb-5 text-[16px] font-semibold text-foreground">
                  Get in touch directly
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand))]" />
                    <div>
                      <p className="text-[13px] font-medium text-foreground">Email</p>
                      <a href="mailto:hello@lci-360.com" className="text-[14px] text-[hsl(var(--brand))] hover:underline">
                        hello@lci-360.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand))]" />
                    <div>
                      <p className="text-[13px] font-medium text-foreground">Phone</p>
                      <a href="tel:+15551234567" className="text-[14px] text-[hsl(var(--brand))] hover:underline">
                        (555) 123-4567
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand))]" />
                    <div>
                      <p className="text-[13px] font-medium text-foreground">Office</p>
                      <p className="text-[14px] text-muted-foreground">
                        Remote-first team<br />
                        Serving clients nationwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-7">
                <h3 className="mb-3 text-[16px] font-semibold text-foreground">
                  Free consultation
                </h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                  Every engagement starts with a free 30-minute call to understand your brand, audience, and goals. No pressure, no commitment — just a clear roadmap for how social media can work for your business.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-[hsl(220,16%,98%)] p-7">
                <h3 className="mb-3 text-[16px] font-semibold text-foreground">
                  Existing client?
                </h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                  Access your content calendar, review drafts, and manage your social connections through the Client Portal.
                </p>
                <a
                  href="/sign-in"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[hsl(var(--brand))] hover:underline"
                >
                  Go to Client Portal <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
