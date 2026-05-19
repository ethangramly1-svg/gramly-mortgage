"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

const ANIMATION_END = 0.82;

type ScrollVideoProps = {
  heightVh?: number;
  src?: string;
  children?: ReactNode;
};

/**
 * Hero with a hardware-decoded <video> element. Replaced the previous
 * canvas-painted scroll-scrubbed frame strip after ~10 rounds of perf
 * optimization couldn't get the canvas approach feeling smooth on
 * average hardware. The browser's video decoder is purpose-built for
 * this: zero scroll-handler painting cost.
 *
 * Trade-off vs the canvas: the video plays on its own pace, not driven
 * by scroll. The penthouse → soar → penthouse narrative still reads
 * because it's the same visual content; the user just isn't "scrubbing"
 * the camera with their scroll wheel.
 *
 * What we keep from the canvas version:
 *   - the scroll spacer that gives the hero its scroll real estate
 *   - the title overlay that fades up + out as you scroll past
 *   - the bottom status bar with a scroll-progress hairline
 *   - the filmic vignette + gold radial scrims
 *   - the overlay-wide fade-out as you exit the hero into the next section
 */
export default function ScrollVideo({
  heightVh = 80,
  src = "/hero.mp4",
  children,
}: ScrollVideoProps) {
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleWrapRef = useRef<HTMLDivElement | null>(null);
  const statusWrapRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const spacerMetricsRef = useRef({ top: 0, height: 0 });
  const rafRef = useRef<number | null>(null);

  // Cached "last applied" DOM values — skip writes when nothing changed.
  const lastTitleOpRef = useRef(-1);
  const lastFadeOpRef = useRef(-1);
  const lastProgressRef = useRef(-1);
  const lastHiddenRef = useRef(false);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refreshMetrics = () => {
      const spacer = spacerRef.current;
      if (spacer) {
        spacerMetricsRef.current = {
          top: spacer.offsetTop,
          height: spacer.offsetHeight,
        };
      }
    };
    refreshMetrics();

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const { top: spacerTop, height: total } = spacerMetricsRef.current;
        if (total <= 0) return;
        const scrolled = Math.max(0, Math.min(total, window.scrollY - spacerTop));
        const t = scrolled / total;

        // 0..ANIMATION_END is the "hero is visible / title fade" range.
        // ANIMATION_END..1 is the "overlay fades out to next section" tail.
        const animP = Math.min(1, t / ANIMATION_END);
        const fo = Math.max(0, Math.min(1, (t - ANIMATION_END) / (1 - ANIMATION_END)));

        // Title fade-up follows the first 45% of the hero range.
        const titleP = Math.min(1, animP / 0.45);
        const titleOpacity = 1 - titleP;
        const titleShift = titleP * -60;

        const titleOpQ = Math.round(titleOpacity * 1000);
        if (titleOpQ !== lastTitleOpRef.current) {
          lastTitleOpRef.current = titleOpQ;
          const title = titleWrapRef.current;
          if (title) {
            title.style.opacity = String(titleOpacity);
            title.style.transform = `translateY(${titleShift}px)`;
          }
          const status = statusWrapRef.current;
          if (status) status.style.opacity = String(titleOpacity);
        }

        const progressQ = Math.round(animP * 1000);
        if (progressQ !== lastProgressRef.current) {
          lastProgressRef.current = progressQ;
          const bar = progressBarRef.current;
          if (bar) bar.style.width = `${animP * 100}%`;
        }

        const fadeQ = Math.round(fo * 1000);
        if (fadeQ !== lastFadeOpRef.current) {
          lastFadeOpRef.current = fadeQ;
          const overlay = overlayRef.current;
          if (overlay) {
            overlay.style.opacity = String(1 - fo);
            overlay.style.pointerEvents = fo > 0.5 ? "none" : "auto";
            const shouldHide = fo >= 0.999;
            if (shouldHide !== lastHiddenRef.current) {
              lastHiddenRef.current = shouldHide;
              overlay.style.visibility = shouldHide ? "hidden" : "visible";
            }
          }
        }
      });
    };

    const onResize = () => {
      refreshMetrics();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    // Some browsers (Safari) require an explicit play() call after the
    // element mounts, even with autoplay. Best-effort — if blocked by
    // autoplay policy we silently swallow the rejection.
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={spacerRef}
        style={{ height: `${heightVh}vh` }}
        className="relative bg-ink"
        aria-hidden
      />

      <div
        ref={overlayRef}
        className="bg-ink"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20,
          opacity: 1,
          pointerEvents: "auto",
          visibility: "visible",
          transition: "opacity 0.05s linear, visibility 0s linear",
        }}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease-out" }}
          aria-hidden
        />

        {/* Filmic scrims — two soft layers. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,11,6,0.55) 0%, rgba(15,11,6,0.05) 28%, rgba(15,11,6,0.00) 55%, rgba(15,11,6,0.45) 82%, rgba(15,11,6,0.92) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 55% at 50% 115%, rgba(212, 180, 106, 0.10), transparent 65%)",
          }}
        />

        {/* HERO TITLE */}
        <div
          ref={titleWrapRef}
          className="absolute inset-0 flex flex-col justify-end items-center md:items-end px-6 md:px-14 lg:px-20 pb-14 md:pb-28 pointer-events-none"
          style={{ opacity: 1, transform: "translateY(0px)", willChange: "opacity, transform" }}
        >
          <div className="pointer-events-auto text-center md:text-right w-full md:w-auto">
            {children ?? <DefaultHeroCopy />}
          </div>
        </div>

        {/* Bottom status bar */}
        <div
          ref={statusWrapRef}
          className="pointer-events-none absolute bottom-0 inset-x-0 px-6 md:px-10 pb-5 md:pb-7"
          style={{ opacity: 1 }}
        >
          <div className="flex items-end justify-between gap-6">
            <div className="flex items-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.4em] text-white/45">
              <span>Chris Gramly · Las Vegas</span>
            </div>
            <div className="relative h-px w-28 md:w-40 bg-white/15 overflow-hidden">
              <div
                ref={progressBarRef}
                className="absolute inset-y-0 left-0 bg-white/50"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DefaultHeroCopy() {
  return (
    <>
      <h1 className="fade-up font-display text-white tracking-[-0.04em] leading-[0.88]">
        <span className="block font-extralight text-[clamp(3.4rem,13vw,8rem)] md:text-[9.5vw]">
          Mortgages
        </span>
        <span className="block text-[clamp(2.4rem,9vw,5.5rem)] md:text-[7vw] mt-1 md:mt-2">
          <span className="italic font-extralight">with</span>{" "}
          <span className="font-semibold">clarity,</span>
        </span>
        <span className="block text-[clamp(1.9rem,7vw,4.4rem)] md:text-[5.6vw] mt-1 md:mt-3">
          <span className="font-semibold">without</span>{" "}
          <span className="italic font-extralight text-bone/65">the friction.</span>
        </span>
      </h1>

      <div
        className="fade-up flex items-center justify-center md:justify-end gap-3 mt-4 md:mt-6"
        style={{ animationDelay: "0.18s" }}
      >
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/60">
          Now offering
        </span>
        <span className="h-px w-4 bg-gold/60" />
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-gold">
          Jumbo Programs
        </span>
      </div>

      <div
        className="fade-up mt-5 md:mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3 md:gap-5"
        style={{ animationDelay: "0.3s" }}
      >
        <Link href="/jumbo" className="btn-gold w-full sm:w-auto justify-center">
          View Jumbo Programs →
        </Link>
        <a href="#collection" className="hidden md:inline-flex btn-ghost">
          All programs ↗
        </a>
      </div>
    </>
  );
}
