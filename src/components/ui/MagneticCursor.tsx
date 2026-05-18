import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

export default function MagneticCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch devices get native cursor via CSS — skip setup entirely
    if (!window.matchMedia("(hover: hover)").matches) return;

    const ring = ringRef.current!;
    const dot  = dotRef.current!;

    // quickTo creates a function that tweens to a new value each call —
    // much cheaper than spawning a new tween on every mousemove.
    const xRing = gsap.quickTo(ring, "x", { duration: 0.52, ease: "power3.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.52, ease: "power3.out" });

    function onMove(e: MouseEvent) {
      // Dot snaps instantly; ring spring-follows
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      xRing(e.clientX);
      yRing(e.clientY);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot"  ref={dotRef}  aria-hidden="true" />
    </>
  );
}
