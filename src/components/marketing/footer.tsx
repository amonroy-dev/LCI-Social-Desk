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
  Resources: [
    { label: "Client Portal", href: "/sign-in" },
  ],
} as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-[hsl(222,24%,10%)] text-[hsl(220,14%,72%)]">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--brand))]/15 text-[hsl(var(--brand))]">
                <span className="font-mono text-[11px] font-bold tracking-tight">LCI</span>
              </span>
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
          <p className="text-[12px] text-white/40">
            lci-360.com
          </p>
        </div>
      </div>
    </footer>
  );
}
