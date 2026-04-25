"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/match", label: "Match by Mood" },
  { href: "/producers", label: "For Producers" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-charcoal-100/70 bg-cream-50/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-cream-50">
            <ThreadMark />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-charcoal-900">
            Threadline
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-charcoal-900 text-cream-50"
                    : "text-charcoal-700 hover:bg-cream-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/match" className="btn-terracotta hidden sm:inline-flex">
          <Sparkles className="h-4 w-4" />
          Try AI Match
        </Link>
      </div>
    </header>
  );
}

function ThreadMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M2 4c4 0 4 8 8 8M14 12c-4 0-4-8-8-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
