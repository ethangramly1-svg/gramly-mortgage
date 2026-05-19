"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/submissions", label: "Submissions" },
  { href: "/dashboard/analytics", label: "Analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="md:fixed md:top-0 md:left-0 md:bottom-0 md:w-60 md:border-r md:border-line bg-ink-soft flex md:flex-col items-center md:items-stretch justify-between md:justify-start px-5 py-5 md:py-8 z-30">
      <div className="md:space-y-10">
        <div className="md:px-1">
          <div className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-gold/60 mb-1">
            § Admin
          </div>
          <div className="font-display text-lg font-light tracking-[-0.02em] text-bone">
            Chris Gramly
          </div>
        </div>

        <nav className="hidden md:flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`block px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.22em] transition-colors ${
                  active
                    ? "text-gold border-l-2 border-gold pl-[10px]"
                    : "text-bone/55 hover:text-bone"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="mt-4 block px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-bone/40 hover:text-gold transition-colors"
          >
            ← Site
          </Link>
        </nav>
      </div>

      <div className="md:mt-auto md:px-1">
        <UserButton />
      </div>
    </aside>
  );
}
