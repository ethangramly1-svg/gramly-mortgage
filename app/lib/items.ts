/**
 * Static data for the home-page PortfolioStack, the /programs index,
 * and the /programs/[slug] dossier pages.
 *
 * Each item is a mortgage program — a real product Chris offers, not
 * a marketing slot. Rates and amounts are illustrative and should be
 * updated against live pricing before launch. `description` paragraphs
 * are written to a real broker's voice and reviewed for compliance
 * (no rate guarantees, no "lowest rates" claims, no implied
 * suitability statements).
 */

export type Item = {
  slug: string;
  index: string;
  name: string;
  subtitle: string;
  location: string;
  region?: string;
  year: string;
  metricA: { label: string; value: string };
  metricB: { label: string; value: string };
  metricC: { label: string; value: string };
  price: string;
  status: string;
  cover: string;
  description?: string[];
  gallery?: string[];
  architect?: string;
  coordinates?: string;
};

export const ITEMS: Item[] = [
  {
    slug: "jumbo",
    index: "Jumbo",
    name: "Jumbo programs",
    subtitle:
      "Luxury home financing above conforming limits — primary or second residence, up to $5M and beyond, with 30-year fixed and ARM paths",
    location: "Primary · Second home",
    region: "California · Nevada",
    year: "2026",
    metricA: { label: "Max", value: "$5M+" },
    metricB: { label: "Down", value: "10%" },
    metricC: { label: "Term", value: "30-yr fixed" },
    price: "from 6.25%",
    status: "Available now",
    cover: "/assets/penthouse-1.png",
    description: [
      "Loans above conforming limits, for primary or second residences across California and Nevada. Funded from a network of correspondent lenders that span $1M to $5M+ purchase prices, with 10–20% down depending on the credit profile and property type.",
      "Three quirks worth flagging. First, jumbo rates are usually lower than conventional rates on the same loan amount — fewer borrowers, sharper pricing. Second, jumbo underwriting reviews assets more carefully than income. Third, second-home jumbo financing is real and underused; if you own one home outright and want another, that's the program.",
      "Best for: buyers in the $766K–$5M purchase range with W-2 or stable self-employment income, primary or second home. Less right for: buyers with a thin asset cushion, recent self-employment under two years, or unusual property types (working farms, mixed-use).",
    ],
  },
  {
    slug: "conventional",
    index: "Purchase",
    name: "Conventional purchase",
    subtitle:
      "Conforming loans backed by Fannie Mae or Freddie Mac. Traditional underwriting, broad eligibility, the standard path home",
    location: "Primary residence",
    region: "California · Nevada",
    year: "2026",
    metricA: { label: "Max", value: "$766K" },
    metricB: { label: "Down", value: "5%" },
    metricC: { label: "Term", value: "15 / 30-yr" },
    price: "from 6.625%",
    status: "Available now",
    cover: "/assets/penthouse-4.png",
    description: [
      "Conforming loans up to the FHFA limit — currently $766K in most California and Nevada counties, higher in Los Angeles and Bay Area high-cost counties. Backed by Fannie Mae or Freddie Mac, which means standardized underwriting, broad lender competition, and rates that move predictably with the bond market.",
      "Down payment ranges 3% to 20%. Sub-20% down means PMI (private mortgage insurance), but PMI on a conventional is removable once you cross 80% loan-to-value — unlike FHA mortgage insurance, which sticks for the life of the loan. That makes conventional with 10–15% down a sharper long-term deal than FHA for most credit-eligible buyers.",
      "Best for: standard W-2 or self-employed buyers with 680+ credit, primary residence. Less right for: very thin down payments under 3%, or borrowers with credit under 620 — both of those usually route to FHA instead.",
    ],
  },
  {
    slug: "refinance",
    index: "Refinance",
    name: "Refinance review",
    subtitle:
      "Lower your rate or pull cash out. Rate-and-term in as little as 21 days; cash-out for renovation, consolidation, or investment",
    location: "Rate · Cash-out",
    region: "California · Nevada",
    year: "2026",
    metricA: { label: "LTV", value: "Up to 80%" },
    metricB: { label: "Close", value: "21 days" },
    metricC: { label: "Term", value: "15–30y" },
    price: "from 6.375%",
    status: "Lock available",
    cover: "/assets/penthouse-3.jpg",
    description: [
      "Two refinance paths, two reasons. Rate-and-term lowers your monthly payment by trading your current rate and term for new ones. Cash-out converts some of your home's equity into liquidity — for renovation, debt consolidation, or investment elsewhere.",
      "The rule of thumb on rate-and-term is the 1% break: if you can drop your rate by a full point, the refinance usually pays for itself in 18–24 months. With cash-out, the math is different — you're optimizing access to capital, not monthly payment, and the rate is usually 0.25–0.5% higher than a comparable rate-and-term.",
      "We close rate-and-term refinances in 21 days when the file is clean. Cash-out is closer to 30 days because the second appraisal and equity verification add steps to the process.",
    ],
  },
  {
    slug: "investment",
    index: "Investor",
    name: "Investment property",
    subtitle:
      "Loans for landlords on 1–4 unit properties. Full-income and DSCR (no-doc) paths for both seasoned investors and first-time buyers",
    location: "1–4 unit · DSCR",
    region: "California · Nevada",
    year: "2026",
    metricA: { label: "Units", value: "1–4" },
    metricB: { label: "Down", value: "25%" },
    metricC: { label: "Type", value: "DSCR" },
    price: "from 7.125%",
    status: "Available now",
    cover: "/assets/penthouse-5.png",
    description: [
      "Loans for owners of 1–4 unit rental properties, single-family or small multifamily. Two underwriting paths: full-income (you qualify on your personal tax returns) or DSCR — Debt Service Coverage Ratio, which qualifies the loan on the rental income alone, no personal income required.",
      "DSCR is the path that opened investment buying to a much wider audience. If the property's rent covers the mortgage payment with a small cushion, you qualify. No tax returns, no W-2s. The trade-off is a slightly higher rate (typically 0.5–1% over conventional) and a 25% down payment minimum.",
      "Best for: existing landlords scaling a portfolio, or first-time investors with strong assets and a property that pencils on rent alone. Less right for: house-hacking — owner-occupied multifamily is usually a conventional loan, not DSCR.",
    ],
  },
  {
    slug: "government",
    index: "First home",
    name: "Government-backed",
    subtitle:
      "FHA for first-time buyers, VA for service members. Lower credit floors, smaller down payments, gentler underwriting",
    location: "First-time · Veterans",
    region: "California · Nevada",
    year: "2026",
    metricA: { label: "Down", value: "0–3.5%" },
    metricB: { label: "Credit", value: "580+" },
    metricC: { label: "Term", value: "30-yr" },
    price: "from 6.5%",
    status: "Available now",
    cover: "/assets/home-financing-hero.png",
    description: [
      "FHA is the path for first-time buyers who haven't built up the 5–20% down payment a conventional requires. 3.5% down with credit as low as 580, or 10% down with credit down to 500. The trade-off is FHA mortgage insurance, which sticks for the loan's lifetime.",
      "VA is for active-duty service members, veterans, and surviving spouses. Zero down payment, no PMI, and the lowest rates of any major program. VA is the closest thing to a no-strings loan that exists. If you're eligible, it's almost always the right product.",
      "Best for: first-time buyers under 20% down (FHA), or service members of any down-payment profile (VA). Less right for: anyone with 5%+ down and clean credit — a conventional loan with removable PMI usually outperforms FHA over the life of the loan.",
    ],
  },
];
