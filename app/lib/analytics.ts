import { createHash, randomBytes } from "node:crypto";

export type DeviceType = "mobile" | "tablet" | "desktop";

/** Lightweight UA → device-type heuristic. Not perfect; good enough for buckets. */
export function parseDevice(userAgent: string | null | undefined): DeviceType {
  const ua = (userAgent ?? "").toLowerCase();
  if (/ipad|tablet|kindle|playbook/.test(ua)) return "tablet";
  if (/mobi|iphone|android|phone|opera mini|blackberry|webos/.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Daily-rotating fingerprint for unique-visitor counting.
 * SHA-256(ip + ua + YYYY-MM-DD) truncated to 16 hex chars.
 * Resets every day → no cross-day tracking; no cookie or storage required;
 * GDPR-safe (no personal identifier persisted longer than 24 hours).
 */
export function sessionIdFor(ip: string, userAgent: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${day}`)
    .digest("hex")
    .slice(0, 16);
}

/** 16-char hex id for table primary keys. */
export function randomId(): string {
  return randomBytes(8).toString("hex");
}
