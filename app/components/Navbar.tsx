"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ITEMS } from "@/app/lib/items";

// Derived from items so the navbar's "Programs" active-state picks up
// any new program slug automatically.
const programSlugs = ITEMS.map((i) => `/programs/${i.slug}`);

const links = [
  { href: "/",         label: "Index",    roman: "i",   match: (p: string) => p === "/" },
  { href: "/programs", label: "Programs", roman: "ii",  match: (p: string) => p === "/programs" || programSlugs.includes(p) },
  { href: "/about",    label: "Practice", roman: "iii", match: (p: string) => p === "/about" },
  { href: "/contact",  label: "Contact",  roman: "iv",  match: (p: string) => p === "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const scrollTopIfSamePath = (href: string) => {
    if (href !== pathname) return;
    window.scrollTo(0, 0);
    window.__lenis?.scrollTo(0, { immediate: true, force: true });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3 backdrop-blur-md bg-ink/65 border-b border-line" : "py-5"
      }`}
    >
      <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => scrollTopIfSamePath("/")}
          className="flex items-center gap-3"
        >
          <Image
            src="/assets/clear-modern-logo.png"
            alt="Clear Modern Mortgage"
            width={140}
            height={33}
            priority
            className="object-contain"
          />
          <span className="font-display font-light text-base tracking-[-0.02em] text-bone">
            Chris Gramly
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => scrollTopIfSamePath(l.href)}
                className="group flex items-baseline gap-2"
              >
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-gold/60">
                  § {l.roman}
                </span>
                <span
                  className={`font-mono text-[0.7rem] uppercase tracking-[0.22em] transition-colors duration-500 ${
                    active ? "text-gold" : "text-bone/65 group-hover:text-gold"
                  }`}
                >
                  {l.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          className="md:hidden font-mono text-[0.65rem] uppercase tracking-[0.3em] text-bone"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-ink z-40 flex flex-col items-center justify-center gap-10 px-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => { scrollTopIfSamePath(l.href); setOpen(false); }}
              className="font-display text-3xl font-light tracking-[-0.03em] text-bone"
            >
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-gold/60 mr-3">
                § {l.roman}
              </span>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
