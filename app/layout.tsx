import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Cormorant Garamond ships only 300–700 (no 200/800). Adjusted the
// weight list accordingly; the rest of the project's vibe still works.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Chris Gramly — Clear, modern mortgage advisory in Las Vegas",
  description:
    "Chris Gramly is a Las Vegas-based mortgage advisor. Clear, modern home financing — purchase and refinance — for buyers across California and Nevada.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body className="noise min-h-full flex flex-col bg-ink text-bone">
        {children}
      </body>
    </html>
  );
}
