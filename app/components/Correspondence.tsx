import Reveal from "./Reveal";
import ContactForm from "./ContactForm";

export default function Correspondence() {
  return (
    <section
      id="correspondence"
      className="relative py-20 md:py-32 overflow-hidden bg-ink-soft"
    >
      <div className="absolute top-12 left-10 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-gold/40 select-none">
        § v
      </div>
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-14 md:gap-16">
        <div className="col-span-12 md:col-span-5 space-y-7">
          <Reveal>
            <span className="eyebrow">§ v · correspondence</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display font-light text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.04em]">
              Let&apos;s talk about
              <br />
              <span className="gold-text">the loan.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="font-body text-bone/65 text-base leading-[1.8] font-light max-w-md">
              Whether you&apos;re purchasing your first home, refinancing for
              the right reasons, or building an investment portfolio — start
              with a conversation. No pressure, no upsell, no robotic intake
              forms.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="hairline w-32" />
            <div className="pt-2 space-y-2">
              <a
                href="mailto:chris.gramly@clearmtg.com"
                className="block font-display text-xl text-bone hover:text-gold transition-colors"
              >
                chris.gramly@clearmtg.com
              </a>
              <a
                href="tel:+17027674072"
                className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-bone/65 hover:text-gold transition-colors"
              >
                (702) 767-4072 →
              </a>
            </div>
          </Reveal>
        </div>
        <div className="col-span-12 md:col-span-7 md:pl-8">
          <Reveal delay={150}>
            <ContactForm source="home" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
