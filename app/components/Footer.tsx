import Link from "next/link";
import FooterMarquee from "./FooterMarquee";

const pages: Array<[string, string]> = [
  ["/", "Index"],
  ["/programs", "Programs"],
  ["/about", "Practice"],
  ["/contact", "Contact"],
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative">
      <FooterMarquee />
      <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-16 md:py-20 grid grid-cols-12 gap-y-10 md:gap-10">
        <div className="col-span-12 md:col-span-5 space-y-5">
          <div className="eyebrow">§ Colophon</div>
          <h3 className="font-display font-extralight text-3xl md:text-4xl leading-[1.05] tracking-[-0.03em] text-bone max-w-md">
            Clear, modern mortgage advisory in Las Vegas
          </h3>
          <div className="hairline w-32" />
          <p className="font-body text-bone/55 text-sm max-w-sm leading-[1.7]">
            A modern lending practice for buyers across California and Nevada. Built for ambition without the friction of a traditional broker.
          </p>
        </div>

        <div className="col-span-6 md:col-span-3 space-y-3">
          <div className="eyebrow-sm">Pages</div>
          {pages.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-bone/65 hover:text-gold transition-colors"
            >
              {label} →
            </Link>
          ))}
        </div>

        <div className="col-span-6 md:col-span-4 space-y-3">
          <div className="eyebrow-sm">Reach</div>
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

        <div className="col-span-12 border-t border-line pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-bone/35">
          <span>© {year} · Chris Gramly</span>
          <span>Las Vegas, NV · NMLS 1984074</span>
        </div>
      </div>
    </footer>
  );
}
