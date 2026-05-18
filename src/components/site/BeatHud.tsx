import { useEffect, useRef } from "react";
import { subscribeScroll } from "../../lib/scroll";
import { getBeat, BEAT_COUNT } from "../../lib/pageBounds";

const LABELS = [
  "01 · Sky approach",
  "02 · Penthouse interior",
  "03 · Transit sky",
  "04 · Penthouse finale"
];

/**
 * Temporary wiring-proof HUD. Bottom-right corner shows which cinematic
 * beat is currently active and its local progress. Delete when the real
 * scenes land and we no longer need to verify the scroll mapping.
 */
export default function BeatHud() {
  const labelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeScroll(({ scrollY, vh }) => {
      const b = getBeat(scrollY, vh);
      if (labelRef.current) {
        labelRef.current.textContent = b.cinematic
          ? `${LABELS[b.index]} · ${(b.localProgress * 100).toFixed(0)}%`
          : `journey complete · ${BEAT_COUNT}/${BEAT_COUNT}`;
      }
      if (barRef.current) {
        barRef.current.style.width = `${(b.journeyProgress * 100).toFixed(1)}%`;
      }
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        padding: "8px 12px",
        background: "rgba(10, 18, 36, 0.72)",
        color: "#f7ecd6",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        borderRadius: 4,
        backdropFilter: "blur(6px)",
        pointerEvents: "none",
        minWidth: 200
      }}
    >
      <div ref={labelRef}>01 · Sky approach · 0%</div>
      <div
        style={{
          marginTop: 6,
          height: 2,
          background: "rgba(247, 236, 214, 0.18)",
          overflow: "hidden"
        }}
      >
        <div ref={barRef} style={{ height: "100%", width: "0%", background: "#d9b063" }} />
      </div>
    </div>
  );
}
