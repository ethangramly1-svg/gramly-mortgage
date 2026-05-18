import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";

export const metadata = {
  title: "Practice — Chris Gramly",
  description:
    "About Chris Gramly — a Las Vegas mortgage advisor licensed in California and Nevada. NMLS 1984074.",
};

const blocks: Array<[string, string]> = [
  [
    "Origin",
    "Chris has been a licensed mortgage advisor since 2018, based in Las Vegas and licensed in California and Nevada. NMLS 1984074. The practice grew out of one observation — that good loans rarely come from the lenders who shout the loudest about rates.",
  ],
  [
    "Method",
    "Every relationship starts with a thirty-minute call. Not a credit pull, not a phone-tree intake, not an automated quote engine. A real conversation about what you're trying to do, what you've tried so far, and which programs actually fit. From there it's twenty-one to thirty days to close — sometimes sooner.",
  ],
  [
    "Material",
    "Jumbo for luxury homes. Conventional for primary residences. FHA and VA for first-time buyers and service members. Investment property loans for 1–4 unit owners. Refinance review for anyone holding a rate that no longer makes sense. Five doors. One advisor.",
  ],
  [
    "What's next",
    "The plan isn't to be the biggest mortgage shop in Vegas. It's to be the one that treats every loan like a referral source — because if the work is good, that's how the next loan arrives.",
  ],
];

export default function AboutPage() {
  return (
    <article className="pt-28 md:pt-32 pb-24 md:pb-32">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 space-y-20 md:space-y-28">
        <header className="space-y-6">
          <span className="eyebrow">§ iii · practice</span>
          <h1 className="font-display font-extralight text-5xl md:text-[7vw] leading-[0.92] tracking-[-0.045em] max-w-3xl">
            A lender
            <br />
            <span className="gold-text">you can talk to.</span>
          </h1>
        </header>

        <Reveal>
          <div className="relative aspect-[16/9] w-full overflow-hidden frame p-1.5 md:p-3">
            <span className="frame-tr" />
            <span className="frame-bl" />
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-soft">
              <Image
                src="/assets/chris-gramly.png"
                alt="Chris Gramly"
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>

        {blocks.map(([label, body]) => (
          <Reveal key={label}>
            <div className="grid grid-cols-12 gap-y-6 md:gap-12">
              <div className="col-span-12 md:col-span-3">
                <div className="eyebrow">§ {label}</div>
              </div>
              <div className="col-span-12 md:col-span-9">
                <p className="font-display font-light text-xl md:text-2xl leading-[1.45] tracking-[-0.015em] text-bone/85 max-w-3xl">
                  {body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}

        <div className="border-t border-line pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="font-display text-3xl font-light tracking-[-0.03em] text-bone/85">
            Want to talk about a loan?
          </div>
          <Link href="/contact" className="btn-gold">Get in touch →</Link>
        </div>
      </div>
    </article>
  );
}
