import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ITEMS } from "@/app/lib/items";
import Reveal from "@/app/components/Reveal";
import Carousel from "@/app/components/Carousel";
import ContactForm from "@/app/components/ContactForm";

export async function generateStaticParams() {
  return ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = ITEMS.find((x) => x.slug === slug);
  if (!item) return {};
  return {
    title: `${item.name} — Chris Gramly`,
    description: item.subtitle,
  };
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = ITEMS.find((x) => x.slug === slug);
  if (!item) notFound();

  const idx = ITEMS.findIndex((x) => x.slug === slug);
  const prev = ITEMS[(idx - 1 + ITEMS.length) % ITEMS.length];
  const next = ITEMS[(idx + 1) % ITEMS.length];

  return (
    <article className="pt-28 md:pt-32 pb-24 md:pb-32">
      <div className="max-w-[1700px] mx-auto px-6 md:px-12 space-y-16 md:space-y-24">
        {/* HEADING BLOCK */}
        <header className="grid grid-cols-12 gap-y-8 md:gap-12 items-end">
          <div className="col-span-12 md:col-span-7 space-y-5">
            <Link href="/programs" className="btn-ghost">← Back to Programs</Link>
            <div className="eyebrow">§ {String(idx + 1).padStart(2, "0")} · {item.location}</div>
            <h1 className="font-display font-extralight text-5xl md:text-[6vw] leading-[0.92] tracking-[-0.045em]">
              {item.name}
            </h1>
            <p className="font-display font-light text-lg md:text-2xl text-bone/65 tracking-[-0.02em] max-w-xl">
              {item.subtitle}.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-px bg-line">
            {[item.metricA, item.metricB, item.metricC, { label: "Status", value: item.status }].map((m) => (
              <div key={m.label} className="bg-ink px-5 py-5">
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-bone/40">{m.label}</div>
                <div className="font-display text-xl md:text-2xl text-bone mt-2 serif-nums font-light tracking-[-0.02em]">{m.value}</div>
              </div>
            ))}
          </div>
        </header>

        {/* PRICE + CTA */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-y border-line py-8">
          <div>
            <div className="eyebrow-sm">Guide price</div>
            <div className="font-display gold-text text-4xl md:text-5xl mt-2 serif-nums font-light tracking-[-0.02em]">{item.price}</div>
          </div>
          <a href="#correspondence" className="btn-gold">Request a dossier →</a>
        </div>

        {/* HERO IMAGE */}
        <div className="relative frame p-1.5 md:p-3">
          <span className="frame-tr" />
          <span className="frame-bl" />
          <div className="relative aspect-[16/9] overflow-hidden bg-ink-soft">
            <Image src={item.cover} alt={item.name} fill sizes="100vw" priority className="object-cover" />
          </div>
        </div>

        {/* DESCRIPTION */}
        {item.description && item.description.length > 0 && (
          <div className="grid grid-cols-12 gap-y-8 md:gap-12">
            <div className="col-span-12 md:col-span-3">
              <div className="eyebrow">§ Notes</div>
            </div>
            <div className="col-span-12 md:col-span-9 space-y-7">
              {item.description.map((p, i) => (
                <Reveal key={i} delay={i * 80}>
                  <p className="font-display font-light text-xl md:text-2xl leading-[1.45] tracking-[-0.015em] text-bone/85 max-w-3xl">
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* EXTERIORS — only renders when we have real per-program gallery photography */}
        {item.gallery && item.gallery.length > 0 && (
          <section className="space-y-6">
            <div className="eyebrow">§ Exteriors</div>
            <Carousel images={item.gallery} alt={item.name} />
          </section>
        )}

        {/* SPECS GRID */}
        <section className="space-y-6">
          <div className="eyebrow">§ Specifications</div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
            {(
              [
                ["Architect", item.architect],
                ["Coordinates", item.coordinates],
                ["Region", item.region],
                ["Year", item.year],
              ] as Array<[string, string | undefined]>
            )
              .filter(([, v]) => Boolean(v))
              .map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-b border-line py-4">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-bone/50">{k}</dt>
                  <dd className="font-display text-lg text-bone tracking-[-0.01em]">{v}</dd>
                </div>
              ))}
          </dl>
        </section>

        {/* CONTACT */}
        <section
          id="correspondence"
          className="border-t border-line pt-16 md:pt-20 grid grid-cols-12 gap-y-10 md:gap-16"
        >
          <div className="col-span-12 md:col-span-5 space-y-6">
            <div className="eyebrow">§ Correspondence</div>
            <h2 className="font-display font-extralight text-4xl md:text-5xl tracking-[-0.04em]">
              Request the
              <br />
              <span className="gold-text">full dossier.</span>
            </h2>
            <p className="font-body text-bone/65 text-base leading-[1.8] font-light max-w-md">
              Program eligibility, current rates, and the closing timeline tailored
              to your file. Sent by reply within 24 hours.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7 md:pl-8">
            <ContactForm source="dossier" />
          </div>
        </section>

        {/* NEXT / PREV */}
        <nav className="border-t border-line pt-10 grid grid-cols-2 gap-8">
          <Link href={`/programs/${prev.slug}`} className="group">
            <div className="eyebrow-sm mb-2">← Previous</div>
            <div className="font-display text-xl md:text-2xl tracking-[-0.02em] text-bone/65 group-hover:text-gold transition-colors">
              {prev.name}
            </div>
          </Link>
          <Link href={`/programs/${next.slug}`} className="group text-right">
            <div className="eyebrow-sm mb-2">Next →</div>
            <div className="font-display text-xl md:text-2xl tracking-[-0.02em] text-bone/65 group-hover:text-gold transition-colors">
              {next.name}
            </div>
          </Link>
        </nav>
      </div>
    </article>
  );
}
