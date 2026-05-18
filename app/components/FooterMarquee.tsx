/**
 * Brand-wordmark marquee — the horizontally-scrolling band at the top
 * of the footer. Uses the `.marquee` CSS keyframe from globals.css
 * (50s translateX -50% loop). 12 items concat'd with themselves makes
 * a 24-span strip that loops seamlessly at the -50% mark.
 */
export default function FooterMarquee() {
  const word = "Chris Gramly";
  const items = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="relative overflow-hidden border-y border-line py-6 md:py-10 bg-ink">
      <div className="flex marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {items.concat(items).map((_, i) => (
          <span
            key={i}
            className="font-display font-extralight text-[13vw] md:text-[10vw] leading-none tracking-[-0.05em] text-bone/[0.08] mx-8 md:mx-14 flex-shrink-0"
          >
            {word} <span className="text-gold/30">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
