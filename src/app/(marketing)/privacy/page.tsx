import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — LCI Marketing",
  description: "How LCI Marketing collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Legal
          </p>
          <h1 className="text-[36px] font-bold tracking-tight text-foreground sm:text-[44px]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Last updated: June 10, 2026
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-[15px] leading-relaxed text-foreground">

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">1. Overview</h2>
            <p className="text-muted-foreground">
              LCI Marketing ("LCI", "we", "our", or "us"), operated by LCI 360 LLC, provides social media management services to businesses. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website (<strong>lci-360.com</strong>), use LCI Social Desk (our proprietary client management platform), or engage with our services.
            </p>
            <p className="mt-3 text-muted-foreground">
              By using our services, you agree to the collection and use of information as described in this policy. If you do not agree, please discontinue use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">2. Information We Collect</h2>
            <h3 className="text-[16px] font-semibold mb-2">Information you provide directly</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Name and email address when you submit a contact form or inquiry</li>
              <li>Business name and social media account information when you become a client</li>
              <li>Login credentials when you create an account on LCI Social Desk</li>
            </ul>

            <h3 className="text-[16px] font-semibold mb-2 mt-5">Information from Meta platforms (Facebook & Instagram)</h3>
            <p className="text-muted-foreground">
              When you authorize our app through Facebook Login, we access the following data from Meta Platforms via the Meta Graph API, solely to provide you with our social media management services:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li>Facebook Page ID, name, and access tokens for your authorized Pages</li>
              <li>Instagram Business Account ID and basic profile information</li>
              <li>Page insights and analytics (impressions, engagements, reach, follower count)</li>
              <li>Instagram insights (impressions, reach, follower count)</li>
              <li>Video view metrics for content published on your Pages</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We access only the data necessary to deliver the services you have requested. We do not sell, rent, or share Meta user data with third parties for advertising or any purpose other than providing our services.
            </p>

            <h3 className="text-[16px] font-semibold mb-2 mt-5">Automatically collected information</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Browser type, device type, and IP address</li>
              <li>Pages visited and time spent on our website</li>
              <li>Referring URLs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li>Provide, operate, and improve our social media management services</li>
              <li>Schedule and publish content to your authorized social media accounts</li>
              <li>Generate analytics reports and performance summaries for your accounts</li>
              <li>Send invite links and approval requests for content review</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We do not use your Meta data to train machine learning models, serve ads, or for any purpose beyond the social media management services we provide to you.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">4. How We Share Your Information</h2>
            <p className="text-muted-foreground">
              We do not sell or rent your personal information. We may share your information only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li><strong>Service providers:</strong> We use Google Firebase for authentication and data storage. Firebase is governed by Google's Privacy Policy and processes data on our behalf.</li>
              <li><strong>Meta Platforms:</strong> When publishing content or retrieving analytics, we interact with the Meta Graph API. This use is governed by Meta's Data Policy.</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or governmental authority.</li>
              <li><strong>Business transfers:</strong> In the event of a merger or acquisition, your information may be transferred to the acquiring entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as your client relationship is active or as needed to provide services. Analytics data and access tokens are retained only as long as necessary to deliver reporting and publishing features. You may request deletion of your data at any time by contacting us (see Section 9).
            </p>
            <p className="mt-3 text-muted-foreground">
              Meta access tokens are refreshed periodically and revoked upon disconnection of your social accounts from our platform.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">6. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your information, including encrypted data storage via Firebase, HTTPS-only data transmission, and restricted access to production systems. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">7. Third-Party Services</h2>
            <p className="text-muted-foreground">Our services integrate with the following third-party platforms:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li><strong>Meta Platforms (Facebook/Instagram)</strong> — Used to access Page data and publish content on your behalf via authorized OAuth tokens.</li>
              <li><strong>Google Firebase</strong> — Used for user authentication and secure data storage.</li>
              <li><strong>Vercel</strong> — Used to host and serve our web application.</li>
              <li><strong>Resend</strong> — Used to send transactional emails (invite links, approval requests).</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Each third-party service operates under its own privacy policy. We encourage you to review those policies.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">8. Cookies</h2>
            <p className="text-muted-foreground">
              Our website uses session cookies to maintain your authenticated state within LCI Social Desk. We do not use tracking cookies or third-party advertising cookies. You can disable cookies in your browser settings, though this may affect the functionality of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">9. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Revoke Meta platform access at any time through your Facebook account settings</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              To exercise any of these rights, contact us at <strong>hello@lci-360.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a minor, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. Continued use of our services after changes are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold tracking-tight mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 rounded-xl border border-border bg-muted/40 p-5 text-muted-foreground">
              <p className="font-semibold text-foreground">LCI 360 LLC</p>
              <p>Email: <a href="mailto:hello@lci-360.com" className="text-[hsl(var(--brand))] hover:underline">hello@lci-360.com</a></p>
              <p>Website: <a href="https://www.lci-360.com" className="text-[hsl(var(--brand))] hover:underline">www.lci-360.com</a></p>
            </div>
          </section>

        </div>

        <div className="mt-16 border-t border-border pt-8">
          <Link href="/" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
