"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Item } from "../lib/items";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned full-viewport stack: cards slide up over each other, one
 * viewport at a time. Standard Locomotive/Awwwards pattern, tuned to
 * feel editorial rather than gimmicky.
 *
 * Desktop ≥ 768px: section pins for N × viewport-heights of scroll;
 *   each successive card animates from yPercent: 100 → 0 across one
 *   viewport's scroll.
 * Mobile: cards render as a flowing vertical list — no pin, no scrub.
 */
export default function PortfolioStack({ items }: { items: Item[] }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>(".portfolio-panel", container);
        if (panels.length < 2) return;

        panels.forEach((panel, i) => {
          if (i === 0) return;
          gsap.set(panel, { yPercent: 100 });

          ScrollTrigger.create({
            trigger: section,
            start: () => `top+=${i * window.innerHeight} top`,
            end: () => `top+=${(i + 1) * window.innerHeight} top`,
            scrub: true,
            animation: gsap.to(panel, { yPercent: 0, ease: "none" }),
            invalidateOnRefresh: true,
          });
        });

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${panels.length * window.innerHeight}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }, section);

      return () => ctx.revert();
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      <div ref={containerRef} className="relative md:h-[100dvh] w-full md:overflow-hidden">
        {items.map((item, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={item.slug}
              className="portfolio-panel relative md:absolute md:inset-0 md:h-[100dvh] w-full bg-ink md:overflow-hidden flex flex-col justify-center py-16 md:py-0"
              style={{ zIndex: i + 1 }}
            >
              <Card item={item} i={i} reverse={reverse} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ item, i, reverse }: { item: Item; i: number; reverse: boolean }) {
  return (
    <div className="w-full max-w-[1700px] mx-auto px-5 md:px-12">
      <Link href={`/programs/${item.slug}`} className="group block relative">
        {/* HUGE ghost number — alternating side, brightens on hover */}
        <span
          className={`pointer-events-none select-none absolute font-display font-light text-[26vw] md:text-[22vw] leading-none tracking-[-0.06em] text-gold/[0.05] group-hover:text-gold/[0.09] transition-colors duration-700 ${
            reverse ? "right-0 -top-10 md:-top-16" : "left-0 -top-10 md:-top-16"
          }`}
        >
          {String(i + 1).padStart(2, "0")}
        </span>

        <div
          className={`relative grid grid-cols-12 gap-4 md:gap-14 items-end ${
            reverse ? "md:[direction:rtl]" : ""
          }`}
        >
          {/* IMAGE column */}
          <div
            className={`col-span-12 md:col-span-8 relative ${
              reverse ? "md:[direction:ltr]" : ""
            }`}
          >
            <div className="relative frame p-1.5 md:p-3">
              <span className="frame-tr" />
              <span className="frame-bl" />
              <div className="relative aspect-[16/10] md:aspect-[5/3] overflow-hidden bg-ink-soft">
                <Image
                  src={item.cover}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
                  priority={i < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background:
                      "radial-gradient(600px 400px at 50% 50%, rgba(212, 180, 106, 0.1), transparent 60%)",
                  }}
                />
                <div className="absolute top-5 left-5">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-bone/90 backdrop-blur-sm bg-ink/20 px-3 py-1.5">
                    {item.index}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* META column */}
          <div
            className={`col-span-12 md:col-span-4 space-y-4 md:space-y-7 ${
              reverse ? "md:[direction:ltr]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-gold to-transparent" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.35em] text-gold">
                {item.location}
              </span>
            </div>

            <div>
              <h3 className="font-display font-light text-[2.4rem] md:text-[4.6vw] leading-[0.95] tracking-[-0.045em] text-bone group-hover:text-gold transition-colors duration-700">
                {item.name}
              </h3>
              <p className="font-body text-[0.95rem] md:text-[1.05rem] text-bone/55 mt-2.5 md:mt-5 leading-[1.5] max-w-md font-light line-clamp-2 md:line-clamp-none">
                {item.subtitle}.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-y border-line py-3 md:py-5">
              {[item.metricA, item.metricB, item.metricC].map((m) => (
                <div key={m.label}>
                  <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/40">
                    {m.label}
                  </div>
                  <div className="font-display text-base md:text-lg text-bone mt-1 serif-nums font-light tracking-[-0.01em]">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between pt-1 md:pt-2">
              <div>
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/40 mb-1">
                  Guide price
                </div>
                <div className="font-display text-2xl md:text-3xl gold-text serif-nums font-light tracking-[-0.02em]">
                  {item.price}
                </div>
              </div>
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-bone/60 group-hover:text-gold transition-[color,letter-spacing] duration-500 group-hover:tracking-[0.26em]">
                Dossier →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
