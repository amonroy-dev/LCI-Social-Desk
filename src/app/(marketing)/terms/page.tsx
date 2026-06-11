import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — LCI Marketing",
  description: "Terms and conditions for using LCI Marketing services and LCI Social Desk.",
};

export default function TermsPage() {
  return (
    <div className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Legal
          </p>
          <h1 className="text-[36px] font-bold tracking-tight text-foreground sm:text-[44px]">
            Terms of Service
          </h1>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Last updated: June 10, 2026
          </p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-foreground">

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the services provided by LCI 360 LLC, operating as LCI Marketing (&ldquo;LCI&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), including our website at <strong>lci-360.com</strong> and our proprietary client management platform, LCI Social Desk. By accessing or using our services, you agree to be bound by these Terms.
            </p>
            <p className="mt-3 text-muted-foreground">
              If you do not agree to these Terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">2. Description of Services</h2>
            <p className="text-muted-foreground">LCI provides social media management services including:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li>Social media strategy development and content planning</li>
              <li>Content creation, scheduling, and publishing on Facebook and Instagram</li>
              <li>Analytics reporting and performance monitoring</li>
              <li>Community management and audience engagement</li>
              <li>Access to LCI Social Desk, our proprietary management platform</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Specific services are defined in individual service agreements or proposals. These Terms apply to all services unless a separate written agreement specifies otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">3. Accounts and Access</h2>
            <p className="text-muted-foreground">
              Access to LCI Social Desk is restricted to authorized users. Accounts are provisioned by LCI staff and are non-transferable. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.
            </p>
            <p className="mt-3 text-muted-foreground">
              By connecting your Facebook Page or Instagram Business Account to our platform, you authorize LCI to access, schedule, and publish content on your behalf using the permissions you grant through Facebook Login. You may revoke this access at any time through your Facebook account settings.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">4. Client Responsibilities</h2>
            <p className="text-muted-foreground">As a client, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li>Provide accurate and up-to-date information about your business and brand</li>
              <li>Review and approve or reject content submitted for your approval in a timely manner</li>
              <li>Ensure you have the rights to any materials (images, logos, copy) you provide to us for use in content</li>
              <li>Comply with Meta&apos;s Terms of Service and Community Standards for your pages and accounts</li>
              <li>Notify us promptly of any changes to your social media accounts or business information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">5. Content Ownership and License</h2>
            <p className="text-muted-foreground">
              You retain full ownership of your brand, trademarks, and any materials you provide to LCI. Content created by LCI on your behalf (captions, graphics, creative concepts) is owned by you upon final delivery and payment for the applicable service period.
            </p>
            <p className="mt-3 text-muted-foreground">
              You grant LCI a limited, non-exclusive license to access your social accounts, publish approved content, and retrieve analytics data solely for the purpose of providing services under our agreement.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">6. Prohibited Uses</h2>
            <p className="text-muted-foreground">You may not use our services to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li>Publish content that is illegal, deceptive, defamatory, or violates third-party rights</li>
              <li>Violate Meta&apos;s Terms of Service, Community Standards, or advertising policies</li>
              <li>Attempt to gain unauthorized access to our platform or other clients&apos; accounts</li>
              <li>Reverse-engineer, copy, or redistribute any part of LCI Social Desk</li>
              <li>Use our services for any purpose that competes with LCI&apos;s business</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">7. Payment Terms</h2>
            <p className="text-muted-foreground">
              Payment terms, rates, and billing cycles are defined in your individual service agreement. Invoices are due within the timeframe specified in that agreement. LCI reserves the right to suspend services for accounts with overdue balances.
            </p>
            <p className="mt-3 text-muted-foreground">
              We operate on a month-to-month basis unless otherwise specified. Either party may terminate services with 30 days&apos; written notice.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">8. Disclaimers and Limitation of Liability</h2>
            <p className="text-muted-foreground">
              LCI provides services on an &ldquo;as-is&rdquo; basis. We make no guarantees regarding specific outcomes such as follower counts, engagement rates, or revenue generated from social media activities. Social media performance is influenced by many factors outside our control, including platform algorithm changes.
            </p>
            <p className="mt-3 text-muted-foreground">
              To the maximum extent permitted by law, LCI&apos;s liability for any claim arising from our services is limited to the amount paid by you for services in the 30 days preceding the claim. LCI is not liable for indirect, consequential, or incidental damages.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">9. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless LCI 360 LLC, its founders, and employees from any claims, losses, or expenses (including legal fees) arising from your use of our services, your content, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">10. Termination</h2>
            <p className="text-muted-foreground">
              Either party may terminate the service relationship with 30 days&apos; written notice. LCI reserves the right to terminate access immediately if you violate these Terms, fail to pay for services, or engage in conduct harmful to LCI or its other clients.
            </p>
            <p className="mt-3 text-muted-foreground">
              Upon termination, LCI will revoke platform access and, upon request, provide you with an export of your analytics data. Meta access tokens will be deauthorized.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of the State of Texas, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Texas.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">12. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. We will notify active clients of material changes via email. Continued use of our services after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">13. Contact</h2>
            <p className="text-muted-foreground">
              Questions about these Terms? Contact us at:
            </p>
            <div className="mt-3 rounded-xl border border-border bg-muted/40 p-5 text-muted-foreground">
              <p className="font-semibold text-foreground">LCI 360 LLC</p>
              <p>Email: <a href="mailto:hello@lci-360.com" className="text-[hsl(var(--brand))] hover:underline">hello@lci-360.com</a></p>
              <p>Website: <a href="https://www.lci-360.com" className="text-[hsl(var(--brand))] hover:underline">www.lci-360.com</a></p>
            </div>
          </section>

        </div>

        <div className="mt-16 border-t border-border pt-8 flex items-center gap-6">
          <Link href="/" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
          <Link href="/privacy" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
