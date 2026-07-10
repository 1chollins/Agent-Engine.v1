"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Listings" },
  { href: "/content", label: "Content" },
  { href: "/settings/brand", label: "Settings" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-forest">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tan font-heading text-base font-semibold text-cream">
            F&amp;F
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight text-cream">
            Agent Engine
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cream/15 text-cream"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="ml-2 border-l border-cream/20 pl-2">
            <LogoutButton />
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-cream/70 transition-colors hover:bg-cream/10 sm:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-cream/15 bg-forest px-6 pb-4 sm:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-cream/15 text-cream"
                      : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-cream/15 pt-2">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
