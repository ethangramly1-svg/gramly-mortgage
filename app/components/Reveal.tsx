"use client";

import { useEffect, useRef } from "react";

/**
 * IntersectionObserver-driven fade-up. The `.reveal` / `.reveal.in` CSS
 * pair was authored in phase 03; this component is just the trigger.
 *
 * Wrap a block (heading, paragraph, image, CTA group). Don't wrap inline
 * spans — the transform/opacity transition is at the block level.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add("in"), delay);
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const Component = Tag as React.ElementType;
  return (
    <Component ref={ref as React.Ref<HTMLElement>} className={`reveal ${className}`}>
      {children}
    </Component>
  );
}
