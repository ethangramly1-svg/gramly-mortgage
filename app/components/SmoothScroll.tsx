"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Single source of scroll authority for the site.
 *
 * On desktop with reduced-motion off, mounts a Lenis instance and
 * bridges it into GSAP's ScrollTrigger ticker. All scroll-bound
 * animations downstream (ScrollVideo, PortfolioStack, CollectionOverture)
 * read the same Lenis frame.
 *
 * Touch devices and prefers-reduced-motion fall through to native
 * scroll — Lenis composed with pinned GSAP timelines stutters too
 * badly on touch hardware to be worth keeping there.
 *
 * Exposes the instance on `window.__lenis` for components (the navbar)
 * that need to scroll-to-top on same-route clicks.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const firstPathRef = useRef(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || coarse) return;

    // Lenis runs on every page including home. We tried disabling it
    // on home to relieve the canvas hero, but Lenis was actually
    // helping perception: it interpolates scroll to sub-integer
    // positions, which is precisely what the ScrollVideo crossfade
    // (in drawFrame) needs to blend between adjacent frames smoothly.
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1,
      lerp: 0.15,
    });

    window.__lenis = lenis;

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest(
        "a"
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Match only `#frag` or `…/#frag` — leave plain Next.js Links alone.
      const isHashOnly = href.startsWith("#");
      const isPageHash = href.includes("/#");
      if (!isHashOnly && !isPageHash) return;

      const hashIdx = href.indexOf("#");
      const targetId = href.slice(hashIdx + 1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return; // target lives on another page — let Link handle it

      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      lenis.off("scroll", onLenisScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      if (window.__lenis === lenis) {
        delete window.__lenis;
      }
    };
  }, [pathname]);

  // Route-change reset. Next.js 16 Link preserves scroll position by
  // default when the new page is visible, which on tall same-background
  // pages leaves pinned sections mid-pin. This effect resets every
  // navigation: either scroll-to-hash (if the new URL has one) or
  // hard reset to top, then refresh ScrollTrigger on the new geometry.
  useEffect(() => {
    if (firstPathRef.current) {
      firstPathRef.current = false;
      return;
    }
    // Lenis is absent on the homepage (intentional — see the mount
    // effect above). Use native scroll APIs as the fallback so route
    // resets still work whether we're navigating to home or away.
    const lenis = window.__lenis;
    lenis?.stop();

    const hash = window.location.hash;
    if (hash) {
      requestAnimationFrame(() => {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          if (lenis) {
            lenis.scrollTo(target, { offset: -80, duration: 1.1, force: true });
          } else {
            target.scrollIntoView({ block: "start" });
          }
        } else {
          window.scrollTo(0, 0);
          lenis?.scrollTo(0, { immediate: true, force: true });
        }
        lenis?.start();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    } else {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
      lenis?.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [pathname]);

  return null;
}
