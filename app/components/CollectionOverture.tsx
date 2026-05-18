"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The second section of the home page — a pinned aperture-reveal
 * transition between <ScrollVideo /> and <PortfolioStack />.
 *
 * Desktop (≥ 768px): GSAP timeline pins the section and scrubs the
 * image clip-path from a horizontal slit to full-bleed, drifts two
 * ghost words behind it in opposite directions, and fades in eyebrow
 * rules, corner brackets, caption, and progress rail.
 *
 * Mobile (< 768px): renders statically — the same layout, but no pin,
 * no scrub, no clip-path animation. Pin + scrubbed clip-path on touch
 * is the single biggest source of mobile jank we've measured.
 *
 * The outer <div className="relative"> wrapper is load-bearing. When
 * GSAP pins the <section>, ScrollTrigger inserts a pin-spacer div
 * between section and its original parent. On route change, React
 * tries to removeChild the section from its expected parent and
 * throws "Node not a child of this node" — unless the parent is a
 * React-owned wrapper that's invariant.
 */
export default function CollectionOverture() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        tl.fromTo(
          ".overture-ghost",
          { xPercent: 28, opacity: 0, letterSpacing: "-0.02em" },
          { xPercent: -32, opacity: 1, letterSpacing: "0.02em", ease: "none" },
          0,
        );

        tl.fromTo(
          ".overture-ghost-echo",
          { xPercent: -22, opacity: 0 },
          { xPercent: 24, opacity: 1, ease: "none" },
          0,
        );

        tl.fromTo(
          ".overture-eyebrow",
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, ease: "power2.out" },
          0,
        );

        tl.fromTo(
          ".overture-rule",
          { scaleX: 0 },
          { scaleX: 1, ease: "power2.out" },
          0,
        );

        tl.fromTo(
          ".overture-clip",
          { clipPath: "inset(49% 18% 49% 18%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "power3.inOut", duration: 1.2 },
          0.1,
        );

        tl.fromTo(
          ".overture-img",
          { scale: 1.5 },
          { scale: 1.02, ease: "none" },
          0.1,
        );

        tl.fromTo(
          ".overture-flare",
          { opacity: 0 },
          { opacity: 1, ease: "power2.out", duration: 0.25, yoyo: true, repeat: 1 },
          0.25,
        );

        tl.fromTo(
          ".overture-bracket",
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, ease: "power2.out", stagger: 0.04 },
          0.6,
        );

        tl.fromTo(
          ".overture-caption",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, ease: "power2.out" },
          0.72,
        );

        tl.fromTo(
          ".overture-meta",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: "power2.out" },
          0.78,
        );

        tl.fromTo(
          ".overture-progress",
          { scaleY: 0 },
          { scaleY: 1, ease: "none" },
          0,
        );
      }, section);

      return () => ctx.revert();
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div className="relative">
      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden bg-ink border-t border-line py-24 md:py-0 md:h-screen"
        aria-label="The Collection — overture"
      >
        {/* Warm radial tie-in. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 50%, rgba(212, 180, 106, 0.10), transparent 70%)",
          }}
        />

        {/* GHOST WORD — back plane, desktop only. */}
        <div className="hidden md:flex pointer-events-none absolute inset-0 items-center justify-center overflow-hidden select-none">
          <span
            className="overture-ghost font-display font-light text-[30vw] md:text-[22vw] leading-none tracking-[-0.05em] text-gold/[0.055] whitespace-nowrap opacity-0"
            style={{ willChange: "transform, opacity" }}
          >
            LENDING
          </span>
        </div>

        {/* ECHO WORD — counter drift, even fainter, desktop only. */}
        <div className="hidden md:flex pointer-events-none absolute inset-0 items-center justify-center overflow-hidden select-none">
          <span
            className="overture-ghost-echo font-display italic font-light text-[16vw] md:text-[10vw] leading-none tracking-[0.02em] text-bone/[0.04] whitespace-nowrap opacity-0"
            style={{ willChange: "transform, opacity" }}
          >
            · without friction ·
          </span>
        </div>

        {/* EYEBROW BAR. */}
        <div className="overture-eyebrow relative md:absolute md:top-10 md:left-0 md:right-0 flex items-center justify-center gap-4 z-20 px-6 mb-10 md:mb-0 md:opacity-0">
          <span className="overture-rule h-px w-10 md:w-16 bg-gold/50 origin-right md:scale-x-0" />
          <span className="eyebrow whitespace-nowrap">
            § II · Lending, refined
          </span>
          <span className="overture-rule h-px w-10 md:w-16 bg-gold/50 origin-left md:scale-x-0" />
        </div>

        {/* CORNER markers — desktop only. */}
        <div className="hidden md:block absolute top-8 md:top-10 left-6 md:left-10 font-mono text-[0.56rem] uppercase tracking-[0.3em] text-gold/40 z-10">
          § ii
        </div>
        <div className="hidden md:block absolute top-8 md:top-10 right-6 md:right-10 font-mono text-[0.56rem] uppercase tracking-[0.3em] text-gold/40 z-10">
          overture
        </div>

        {/* VERTICAL progress rail — desktop only. */}
        <div className="hidden md:block absolute top-1/2 right-8 -translate-y-1/2 h-40 w-px bg-line z-10">
          <div
            className="overture-progress absolute inset-0 bg-gradient-to-b from-gold/60 via-gold to-gold/30 origin-top"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        {/* CENTER STAGE — signature image. */}
        <div className="relative md:absolute md:inset-0 flex items-center justify-center px-5 md:px-12 z-10">
          <div
            className="relative w-full"
            style={{ maxWidth: "min(1060px, calc(62vh * 1.6))" }}
          >
            {/* Four corner brackets. */}
            <span className="overture-bracket absolute -top-4 -left-4 md:-top-5 md:-left-5 w-8 h-8 md:w-10 md:h-10 border-l border-t border-gold md:opacity-0" />
            <span className="overture-bracket absolute -top-4 -right-4 md:-top-5 md:-right-5 w-8 h-8 md:w-10 md:h-10 border-r border-t border-gold md:opacity-0" />
            <span className="overture-bracket absolute -bottom-4 -left-4 md:-bottom-5 md:-left-5 w-8 h-8 md:w-10 md:h-10 border-l border-b border-gold md:opacity-0" />
            <span className="overture-bracket absolute -bottom-4 -right-4 md:-bottom-5 md:-right-5 w-8 h-8 md:w-10 md:h-10 border-r border-b border-gold md:opacity-0" />

            <div className="overture-clip relative aspect-[16/10] w-full overflow-hidden bg-ink-soft md:[clip-path:inset(49%_18%_49%_18%)]">
              <div
                className="overture-img absolute inset-0 md:scale-[1.5]"
                style={{ willChange: "transform" }}
              >
                <Image
                  src="/assets/penthouse-2.jpg"
                  alt="Chris Gramly — signature work"
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-cover"
                  priority
                />
                {/* Vignette + warm radial over the photo. */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(15,11,6,0.10) 0%, rgba(15,11,6,0) 28%, rgba(15,11,6,0) 68%, rgba(15,11,6,0.55) 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay"
                  style={{
                    background:
                      "radial-gradient(80% 60% at 50% 55%, rgba(212, 180, 106, 0.14), transparent 70%)",
                  }}
                />
              </div>

              {/* Aperture flare. */}
              <div
                className="overture-flare absolute inset-0 pointer-events-none opacity-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 45%, rgba(236, 210, 140, 0.35) 50%, transparent 55%)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM caption + meta. */}
        <div className="relative md:absolute mt-10 md:mt-0 md:bottom-16 md:left-0 md:right-0 z-20 px-5 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 md:gap-6 max-w-[1100px] mx-auto">
            <div className="overture-caption md:opacity-0">
              <div className="hairline w-16 md:w-24 mb-3 md:mb-4" />
              <p className="font-display font-light text-[1.7rem] md:text-[2.2rem] leading-[1.05] tracking-[-0.025em] text-bone">
                A modern lender.
                <br />
                <span className="text-bone/45">Las Vegas.</span>
              </p>
            </div>
            <div className="overture-meta text-left md:text-right md:opacity-0 self-stretch md:self-auto">
              <p className="font-mono text-[0.56rem] md:text-[0.58rem] uppercase tracking-[0.28em] md:tracking-[0.32em] text-gold/70 mb-1">
                36.169° N · 115.140° W
              </p>
              <p className="font-mono text-[0.52rem] md:text-[0.56rem] uppercase tracking-[0.24em] md:tracking-[0.28em] text-bone/40">
                The portfolio, below ↓
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
