"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SKIP = ["/dashboard", "/sign-in", "/api", "/_next"];

/**
 * Fires a tiny analytics beacon to /api/analytics/track on each
 * pathname change. Uses navigator.sendBeacon when available (survives
 * page unloads) and falls back to fetch keepalive. Mounted once in
 * the root layout.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (SKIP.some((p) => pathname.startsWith(p))) return;

    const body = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", new Blob([body], { type: "application/json" }));
        return;
      }
    } catch {
      // sendBeacon can throw under strict CSP — fall through to fetch.
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => { /* ignore — best-effort beacon */ });
  }, [pathname]);

  return null;
}
