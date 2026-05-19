"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

const FRAME_COUNT = 61;
const ANIMATION_END = 0.82;

type ScrollVideoProps = {
  heightVh?: number;
  framesBase?: string;
  children?: ReactNode;
};

type Tier = "mobile" | "desktop-1x" | "desktop-2x";

function pickTier(): Tier {
  const w = window.innerWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (w < 768) return "mobile";
  return w * dpr >= 2000 ? "desktop-2x" : "desktop-1x";
}

function framePath(base: string, tier: Tier, frameNum: number) {
  return `/${base}/${tier}/${String(frameNum).padStart(3, "0")}.webp`;
}

export default function ScrollVideo({
  heightVh = 220,
  framesBase = "frames",
  children,
}: ScrollVideoProps) {
  // DOM refs — every per-frame write goes through one of these.
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const titleWrapRef = useRef<HTMLDivElement | null>(null);
  const statusWrapRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const bitmapsRef = useRef<(ImageBitmap | null)[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const viewRef = useRef({ w: 0, h: 0, dpr: 1 });
  const spacerMetricsRef = useRef({ top: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(-1);
  const totalFramesRef = useRef(FRAME_COUNT);

  // "last applied DOM value" cache — skip writes when nothing visibly changed.
  const lastTitleOpRef = useRef(-1);
  const lastFadeOpRef = useRef(-1);
  const lastProgressRef = useRef(-1);
  const lastHiddenRef = useRef(false);

  // State only for things that drive React renders (loading splash).
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [totalFrames, setTotalFrames] = useState(FRAME_COUNT);
  const [effectiveHeight, setEffectiveHeight] = useState(heightVh);

  useEffect(() => {
    const tier = pickTier();
    const isMobile = tier === "mobile";
    // Step through frames on mobile and retina/4K too — at normal scroll
    // speed you can't see the difference between every-frame and every-
    // other-frame, but halving the strip halves decode + draw + memory
    // on the device tiers that need the headroom most.
    const frameStep = isMobile || tier === "desktop-2x" ? 2 : 1;
    const frameCount = Math.ceil(FRAME_COUNT / frameStep);

    totalFramesRef.current = frameCount;
    setTotalFrames(frameCount);
    if (isMobile) setEffectiveHeight(160);

    // Refresh cached viewport, canvas, and spacer metrics.
    // Called on mount + resize. The scroll handler and drawFrame both
    // read from these caches so the hot path never touches window.*
    // or getBoundingClientRect (which can force a layout flush).
    const refreshMetrics = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      viewRef.current = { w, h, dpr };

      const needsResize =
        canvas.width !== Math.round(w * dpr) ||
        canvas.height !== Math.round(h * dpr);
      if (needsResize) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        lastFrameRef.current = -1;
      }

      // Canvas resize wipes the 2D context state, so we (re)configure
      // it here whenever it changes. Cached for subsequent draws.
      // imageSmoothingEnabled = false renders frames pixel-direct —
      // sharper detail on the building, zero resampling cost.
      if (!ctxRef.current || needsResize) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.imageSmoothingEnabled = false;
          ctxRef.current = ctx;
        }
      }

      const spacer = spacerRef.current;
      if (spacer) {
        spacerMetricsRef.current = {
          top: spacer.offsetTop,
          height: spacer.offsetHeight,
        };
      }
    };

    // Resolve the best paintable source for a frame index — prefer the
    // GPU-ready ImageBitmap, fall back to the HTMLImageElement if the
    // bitmap hasn't been created yet (or the platform doesn't support
    // createImageBitmap).
    const sourceFor = (i: number): ImageBitmap | HTMLImageElement | null => {
      const bm = bitmapsRef.current[i];
      if (bm) return bm;
      const img = imagesRef.current[i];
      if (img && img.complete && img.naturalWidth) return img;
      return null;
    };

    // drawFrame accepts a *fractional* frame index. The integer part
    // selects the primary frame (drawn at full opacity); the fractional
    // part is the crossfade alpha for the next frame, painted on top.
    // This gives sub-frame smoothness — at slow scroll velocities you
    // see a continuous blend between adjacent frames instead of
    // discrete frame steps, which was the "flipbook" choppiness.
    const drawFrame = (idxFloat: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const fc = totalFramesRef.current;
      const idx = Math.floor(idxFloat);
      const next = Math.min(idx + 1, fc - 1);
      const blend = idxFloat - idx;

      const primary = sourceFor(idx);
      if (!primary) return; // primary frame not loaded — keep previous paint.

      const { w, h } = viewRef.current;

      // Background fill on every paint. Required for crossfade — without
      // it the previous frame would compound through the alpha blend on
      // each tick. Also serves as the initial canvas-clear behavior.
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0f0b06";
      ctx.fillRect(0, 0, w, h);

      const paint = (src: ImageBitmap | HTMLImageElement, alpha: number) => {
        const iw = "naturalWidth" in src ? src.naturalWidth : src.width;
        const ih = "naturalHeight" in src ? src.naturalHeight : src.height;
        const scale = Math.max(w / iw, h / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.globalAlpha = alpha;
        ctx.drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh);
      };

      paint(primary, 1);
      if (blend > 0.01 && next !== idx) {
        const secondary = sourceFor(next);
        if (secondary) paint(secondary, blend);
      }

      ctx.globalAlpha = 1; // reset for any other canvas work
      lastFrameRef.current = idx;
    };

    refreshMetrics();

    // Preload every frame the tier needs. First 8 get fetchPriority high
    // so the opening shot paints before the rest of the strip catches up.
    // Each loaded image is also converted to an ImageBitmap so drawImage
    // on the scroll hot path skips the HTMLImageElement → texture upload
    // step. createImageBitmap runs off the main thread when supported.
    const imgs: HTMLImageElement[] = [];
    const bitmaps: (ImageBitmap | null)[] = new Array(frameCount).fill(null);
    let done = 0;
    for (let i = 0; i < frameCount; i++) {
      const frameNum = i * frameStep + 1;
      const img = new Image();
      img.decoding = "async";
      if (i < 8) (img as unknown as { fetchPriority: string }).fetchPriority = "high";
      // attach onload BEFORE src so cached responses still fire.
      img.onload = () => {
        if (typeof createImageBitmap === "function") {
          createImageBitmap(img).then(
            (bm) => { bitmaps[i] = bm; },
            () => {}, // bitmap creation failed — drawFrame falls back to img.
          );
        }
        done += 1;
        setLoaded(done);
        // Gate ready on frame 0 specifically — not whichever loads first.
        // If we used "first to load", drawFrame(0) could fire while frame 0
        // is still loading, bail out, and never retry.
        if (i === 0) {
          setReady(true);
          requestAnimationFrame(() => drawFrame(0));
        }
      };
      img.onerror = () => {
        done += 1;
        setLoaded(done);
      };
      img.src = framePath(framesBase, tier, frameNum);
      imgs.push(img);
    }
    imagesRef.current = imgs;
    bitmapsRef.current = bitmaps;

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const { top: spacerTop, height: total } = spacerMetricsRef.current;
        if (total <= 0) return;
        const scrolled = Math.max(0, Math.min(total, window.scrollY - spacerTop));
        const t = scrolled / total;

        // Scrub portion (0..ANIMATION_END maps to 0..1 of frames).
        // Pass the fractional frame index so drawFrame can crossfade
        // between the integer-floor frame and the next one. We don't
        // dedup on the integer frame here — sub-integer changes still
        // need to repaint for the crossfade to be visible. Each repaint
        // is cheap (ImageBitmap + globalAlpha) so the cost is fine.
        const animP = Math.min(1, t / ANIMATION_END);
        const fc = totalFramesRef.current;
        const frameFloat = Math.max(0, Math.min(fc - 1, animP * (fc - 1)));
        drawFrame(frameFloat);

        // Tail portion (ANIMATION_END..1) fades the whole overlay out.
        const fo = Math.max(0, Math.min(1, (t - ANIMATION_END) / (1 - ANIMATION_END)));

        // Title fade-up follows the first 45% of the scrub.
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
      drawFrame(lastFrameRef.current >= 0 ? lastFrameRef.current : 0);
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      // Release decoded image cache for GC.
      imagesRef.current.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
      imagesRef.current = [];
      // Close ImageBitmaps to release their backing GPU memory
      // immediately rather than waiting for GC.
      bitmapsRef.current.forEach((b) => b?.close());
      bitmapsRef.current = [];
      ctxRef.current = null;
    };
  }, [framesBase]);

  return (
    <>
      <div
        ref={spacerRef}
        style={{ height: `${effectiveHeight}vh` }}
        className="relative bg-ink"
        aria-hidden
      />

      <div
        ref={overlayRef}
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
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block"
          style={{ width: "100%", height: "100%", willChange: "transform" }}
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
        {/* Plain (non-blending) gold radial. mix-blend-overlay forced
            a per-paint recomposite of the canvas into this layer; dropping
            it cuts the scroll compositing cost noticeably. Lowered alpha
            (0.22 -> 0.10) compensates so the warmth reads similarly. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 55% at 50% 115%, rgba(212, 180, 106, 0.10), transparent 65%)",
          }}
        />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink z-40">
            <div className="text-center">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-gold/80 mb-4">
                Rendering the film
              </div>
              <div className="h-px w-48 bg-line relative overflow-hidden mx-auto">
                <div
                  className="absolute top-0 left-0 h-full bg-gold transition-[width]"
                  style={{ width: `${(loaded / totalFrames) * 100}%` }}
                />
              </div>
              <div className="mt-3 font-mono text-[0.55rem] tracking-[0.3em] text-bone/40">
                {String(Math.round((loaded / totalFrames) * 100)).padStart(2, "0")} / 100
              </div>
            </div>
          </div>
        )}

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
