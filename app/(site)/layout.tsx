import type { ReactNode } from "react";
import SmoothScroll from "@/app/components/SmoothScroll";

/**
 * Route group layout for the public site. Real <header> and <footer>
 * components arrive in phase 07; for now they're empty shells so the
 * tree matches the eventual structure and SmoothScroll lives at the
 * single mount point it'll keep.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <header aria-label="Site header (phase 07)" />
      <main className="flex-1">{children}</main>
      <footer aria-label="Site footer (phase 07)" />
    </>
  );
}
