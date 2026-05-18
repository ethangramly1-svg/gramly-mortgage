/**
 * Static data for the home-page PortfolioStack and the (phase-08) detail
 * pages. Each item is a mortgage program — a real product Chris offers,
 * not a marketing slot. Rates and amounts shown are illustrative and
 * should be updated against live pricing before launch.
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
    year: "2026",
    metricA: { label: "Max", value: "$5M+" },
    metricB: { label: "Down", value: "10%" },
    metricC: { label: "Term", value: "30-yr fixed" },
    price: "from 6.25%",
    status: "Available now",
    cover: "/assets/penthouse-1.png",
  },
  {
    slug: "conventional",
    index: "Purchase",
    name: "Conventional purchase",
    subtitle:
      "Conforming loans backed by Fannie Mae or Freddie Mac. Traditional underwriting, broad eligibility, the standard path home",
    location: "Primary residence",
    year: "2026",
    metricA: { label: "Max", value: "$766K" },
    metricB: { label: "Down", value: "5%" },
    metricC: { label: "Term", value: "15 / 30-yr" },
    price: "from 6.625%",
    status: "Available now",
    cover: "/assets/penthouse-4.png",
  },
  {
    slug: "refinance",
    index: "Refinance",
    name: "Refinance review",
    subtitle:
      "Lower your rate or pull cash out. Rate-and-term in as little as 21 days; cash-out for renovation, consolidation, or investment",
    location: "Rate · Cash-out",
    year: "2026",
    metricA: { label: "LTV", value: "Up to 80%" },
    metricB: { label: "Close", value: "21 days" },
    metricC: { label: "Term", value: "15–30y" },
    price: "from 6.375%",
    status: "Lock available",
    cover: "/assets/penthouse-3.jpg",
  },
  {
    slug: "investment",
    index: "Investor",
    name: "Investment property",
    subtitle:
      "Loans for landlords on 1–4 unit properties. Full-income and DSCR (no-doc) paths for both seasoned investors and first-time buyers",
    location: "1–4 unit · DSCR",
    year: "2026",
    metricA: { label: "Units", value: "1–4" },
    metricB: { label: "Down", value: "25%" },
    metricC: { label: "Type", value: "DSCR" },
    price: "from 7.125%",
    status: "Available now",
    cover: "/assets/penthouse-5.png",
  },
  {
    slug: "government",
    index: "First home",
    name: "Government-backed",
    subtitle:
      "FHA for first-time buyers, VA for service members. Lower credit floors, smaller down payments, gentler underwriting",
    location: "First-time · Veterans",
    year: "2026",
    metricA: { label: "Down", value: "0–3.5%" },
    metricB: { label: "Credit", value: "580+" },
    metricC: { label: "Term", value: "30-yr" },
    price: "from 6.5%",
    status: "Available now",
    cover: "/assets/home-financing-hero.png",
  },
];
