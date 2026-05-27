"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/results", label: "Results" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-white/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--brand))] text-white shadow-sm">
            <span className="font-mono text-[11px] font-bold tracking-tight">LCI</span>
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-foreground">
              LCI Marketing
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                pathname === href
                  ? "text-[hsl(var(--brand))]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="rounded-md px-3.5 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Client Portal
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-9 items-center rounded-lg bg-[hsl(var(--brand))] px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[hsl(var(--brand))]/90"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-white px-5 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors",
                  pathname === href
                    ? "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {label}
              </Link>
            ))}
            <div className="mt-3 border-t border-border pt-3 flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:text-foreground"
              >
                Client Portal
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[hsl(var(--brand))] px-4 text-[14px] font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
