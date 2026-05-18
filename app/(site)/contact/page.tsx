import ContactForm from "@/app/components/ContactForm";

export const metadata = {
  title: "Contact — Chris Gramly",
  description:
    "Send a note to Chris Gramly — Las Vegas mortgage advisor licensed in California and Nevada.",
};

export default function ContactPage() {
  return (
    <article className="pt-28 md:pt-32 pb-24 md:pb-32">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-14 md:gap-16">
        <header className="col-span-12 md:col-span-5 space-y-6">
          <span className="eyebrow">§ iv · contact us</span>
          <h1 className="font-display font-extralight text-5xl md:text-[5.5vw] leading-[0.95] tracking-[-0.04em]">
            Get in
            <br />
            <span className="gold-text">touch.</span>
          </h1>
          <p className="font-body text-bone/65 text-base leading-[1.8] font-light max-w-md">
            Send a note. Real human reply within 24 hours, usually faster. No
            pressure, no immediate phone calls, no sales sequences.
          </p>
          <div className="hairline w-32" />
          <div className="space-y-2 pt-2">
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
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-bone/45 pt-3">
              Las Vegas, NV
            </p>
          </div>
        </header>
        <div className="col-span-12 md:col-span-7 md:pl-8">
          <ContactForm source="contact" />
        </div>
      </div>
    </article>
  );
}
