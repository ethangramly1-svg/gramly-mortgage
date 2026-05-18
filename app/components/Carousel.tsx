"use client";

import { useRef } from "react";
import Image from "next/image";

/**
 * Horizontal scroll-snap gallery. Used by the per-item detail pages
 * (phase 08). One image at a time, prev/next buttons, native snap
 * scrolling on touch.
 *
 * The `data-lenis-prevent` attribute is critical — without it Lenis
 * translates horizontal wheel events into vertical scroll, which
 * would prevent users from scrolling the carousel sideways. The
 * attribute is honored by the .lenis CSS rules from globals.css.
 */
export default function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-3 md:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-lenis-prevent
      >
        {images.map((src, i) => (
          <div
            key={src + i}
            className="relative flex-shrink-0 snap-start w-[88vw] md:w-[60vw] aspect-[16/10] bg-ink-soft frame p-1.5"
          >
            <span className="frame-tr" />
            <span className="frame-bl" />
            <Image
              src={src}
              alt={`${alt} — ${i + 1}`}
              fill
              sizes="(max-width: 768px) 88vw, 60vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-5">
        <button onClick={() => scroll(-1)} className="btn-ghost">← Prev</button>
        <button onClick={() => scroll(1)} className="btn-ghost">Next →</button>
      </div>
    </div>
  );
}
