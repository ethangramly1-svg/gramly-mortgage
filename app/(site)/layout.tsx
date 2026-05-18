import type { ReactNode } from "react";
import SmoothScroll from "@/app/components/SmoothScroll";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
