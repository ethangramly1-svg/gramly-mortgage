import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { randomId } from "@/app/lib/analytics";
import { sendLeadNotification, sendLeadConfirmation } from "@/app/lib/email";

export const runtime = "nodejs";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  source?: "home" | "contact" | "dossier";
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "missing_fields", details: "name, email, and message are required" },
      { status: 422 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 422 });
  }

  const id = randomId();
  const phone = (body.phone ?? "").trim() || null;
  const service = (body.service ?? "").trim() || null;
  const source: "home" | "contact" | "dossier" =
    body.source === "contact" || body.source === "dossier" ? body.source : "home";

  // DB insert is the contract: leads are captured even if email plumbing
  // fails. Email sends below are best-effort and never throw upward.
  await getDB()
    .prepare(
      `INSERT INTO form_submissions (id, name, email, phone, service, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, name, email, phone, service, message, source)
    .run();

  const payload = { id, name, email, phone, service, message, source };
  // Fire both in parallel — neither blocks the other. Each function
  // catches its own errors and logs them; the route always returns 201.
  await Promise.allSettled([
    sendLeadNotification(payload),
    sendLeadConfirmation(payload),
  ]);

  return NextResponse.json({ success: true, id }, { status: 201 });
}
