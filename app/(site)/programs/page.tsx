import Link from "next/link";
import Image from "next/image";
import Reveal from "@/app/components/Reveal";
import { ITEMS } from "@/app/lib/items";

export const metadata = {
  title: "Programs — Chris Gramly",
  description:
    "Five lending programs serving California and Nevada — jumbo, conventional, refinance, investment property, and government-backed.",
};

export default function IndexPage() {
  return (
    <>
      <section className="relative min-h-[70vh] flex flex-col justify-center pt-28 md:pt-32 pb-16 md:pb-24 px-6 md:px-12">
        <div className="max-w-[1700px] mx-auto w-full">
          <span className="eyebrow">§ ii · Programs</span>
          <h1 className="mt-6 font-display font-extralight text-6xl md:text-[10vw] leading-[0.9] tracking-[-0.045em]">
            The <span className="italic font-extralight">current</span>
            <br />
            <span className="gold-text">programs.</span>
          </h1>
          <p className="mt-8 font-display font-light text-xl md:text-2xl tracking-[-0.02em] text-bone/55 max-w-xl">
            Five lending programs serving California and Nevada. Each is reviewable in detail — start where you think you fit, or write us if you&apos;re not sure.
          </p>
        </div>
      </section>

      <section className="bg-ink border-t border-line py-20 md:py-28">
        <div className="max-w-[1700px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-x-8 gap-y-16 md:gap-y-24">
          {ITEMS.map((item, i) => (
            <Reveal key={item.slug} delay={i * 60} className="col-span-12 md:col-span-6">
              <Link href={`/programs/${item.slug}`} className="group block">
                <div className="relative frame p-1.5 md:p-3">
                  <span className="frame-tr" />
                  <span className="frame-bl" />
                  <div className="relative aspect-[5/3] overflow-hidden bg-ink-soft">
                    <Image
                      src={item.cover}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  </div>
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <div>
                    <div className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-2">
                      {item.location}
                    </div>
                    <h2 className="font-display font-light text-3xl tracking-[-0.03em] text-bone group-hover:text-gold transition-colors duration-700">
                      {item.name}
                    </h2>
                  </div>
                  <span className="font-display gold-text serif-nums text-2xl">{item.price}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
