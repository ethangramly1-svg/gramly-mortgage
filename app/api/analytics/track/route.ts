import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { parseDevice, sessionIdFor, randomId } from "@/app/lib/analytics";

export const runtime = "nodejs";

type Body = {
  path?: string;
  referrer?: string;
  userAgent?: string;
};

const SKIP_PATH_PREFIXES = ["/dashboard", "/sign-in", "/api", "/_next"];

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = (body.path ?? "").trim();
  if (!path || SKIP_PATH_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const ua = body.userAgent ?? req.headers.get("user-agent") ?? "";
  const referrer = (body.referrer ?? "").trim() || null;
  const country = req.headers.get("cf-ipcountry") ?? null;
  const ip = req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
  const sessionId = sessionIdFor(ip, ua);
  const device = parseDevice(ua);

  await getDB()
    .prepare(
      `INSERT INTO page_views (id, path, referrer, user_agent, device_type, country, session_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(randomId(), path, referrer, ua, device, country, sessionId)
    .run();

  return NextResponse.json({ ok: true });
}
