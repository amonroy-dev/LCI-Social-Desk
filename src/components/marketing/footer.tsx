import Image from "next/image";
import Link from "next/link";

const FOOTER_NAV = {
  Services: [
    { label: "Social Media Management", href: "/services#management" },
    { label: "Content Creation", href: "/services#content" },
    { label: "Analytics & Reporting", href: "/services#analytics" },
    { label: "Paid Social", href: "/services#paid" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Results", href: "/results" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-[hsl(222,24%,10%)] text-[hsl(220,14%,72%)]">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/lci-icon.svg"
                alt="LCI Marketing"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-[15px] font-semibold tracking-tight text-white">
                LCI Marketing
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed max-w-xs">
              Full-service social media management for brands that want to grow their presence and drive real results.
            </p>
          </div>
          {Object.entries(FOOTER_NAV).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-white/60">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[13.5px] transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-[12px] text-white/40">
            &copy; {new Date().getFullYear()} LCI Marketing. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[12px] text-white/40">
            <Link href="/privacy" className="transition-colors hover:text-white/80">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white/80">
              Terms of Service
            </Link>
            <Link
              href="/sign-in"
              className="transition-colors hover:text-white/80"
              title="LCI team members only"
            >
              Team sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
