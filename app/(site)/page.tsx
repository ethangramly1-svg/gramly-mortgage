import ScrollVideo from "@/app/components/ScrollVideo";
import CollectionOverture from "@/app/components/CollectionOverture";
import PortfolioStack from "@/app/components/PortfolioStack";
import Correspondence from "@/app/components/Correspondence";
import { ITEMS } from "@/app/lib/items";

export default function Home() {
  return (
    <>
      <ScrollVideo heightVh={80} />
      <CollectionOverture />
      <section id="collection" className="relative bg-ink border-y border-line">
        <PortfolioStack items={ITEMS.filter((x) => x.slug !== "jumbo")} />

        {/* Closure block — after the stack finishes */}
        <div className="relative z-10 bg-ink px-6 md:px-12 max-w-[1700px] mx-auto py-24 md:py-36">
          <div className="text-center">
            <div className="hairline max-w-sm mx-auto mb-8" />
            <p className="font-display text-2xl md:text-3xl text-bone/55 font-light tracking-[-0.02em]">
              The current portfolio.
            </p>
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-gold">
              New programs · by correspondence
            </p>
          </div>
        </div>
      </section>
      <Correspondence />
    </>
  );
}
