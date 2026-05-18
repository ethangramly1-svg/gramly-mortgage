export default function HomePage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
      <span className="eyebrow">§ i · Las Vegas</span>

      <h1 className="font-display font-extralight text-[clamp(3rem,10vw,8rem)] tracking-[-0.04em] leading-[0.88] text-center">
        <span className="block">Chris</span>
        <span className="block gold-text">Gramly</span>
      </h1>

      <div className="hairline w-48" />

      <p className="font-display text-bone/55 text-xl font-light tracking-[-0.02em] max-w-md text-center">
        Clear, modern mortgage advisory in Las Vegas
      </p>

      <div className="flex gap-5 mt-4">
        <button className="btn-gold">Primary action →</button>
        <button className="btn-ghost">Secondary ↗</button>
      </div>

      <div className="frame p-6 mt-12 max-w-md">
        <span className="frame-tr" />
        <span className="frame-bl" />
        <p className="font-body text-bone/70 text-base">
          A small block of body copy inside the corner-bracket frame, to
          demonstrate the structural language.
        </p>
      </div>
    </section>
  );
}
