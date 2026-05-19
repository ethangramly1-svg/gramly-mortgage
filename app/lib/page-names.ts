import { ITEMS } from "./items";

/**
 * Friendly names for the analytics dashboard's Top Pages table.
 * Static routes are listed explicitly; dynamic /programs/[slug] routes
 * are generated from the ITEMS array so adding a new program picks
 * up its friendly name automatically.
 */
export const PAGE_NAMES: Record<string, string> = {
  "/": "Homepage",
  "/programs": "Programs",
  "/about": "Practice",
  "/contact": "Contact",
  ...Object.fromEntries(ITEMS.map((i) => [`/programs/${i.slug}`, `Program · ${i.name}`])),
};

export function pageNameFor(path: string): string {
  return PAGE_NAMES[path] ?? path;
}
