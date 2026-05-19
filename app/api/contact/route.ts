import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { randomId } from "@/app/lib/analytics";
import {
  sendAdminNotification,
  sendCustomerConfirmation,
  type SubmissionPayload,
} from "@/app/lib/email";

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
  const phone = (body.phone ?? "").trim() || undefined;
  const service = (body.service ?? "").trim() || undefined;
  const source: "home" | "contact" | "dossier" =
    body.source === "contact" || body.source === "dossier" ? body.source : "home";
  const created_at = new Date().toISOString();

  // DB insert is the contract: leads are captured even if email plumbing
  // fails. Email sends below are best-effort and never throw upward.
  await getDB()
    .prepare(
      `INSERT INTO form_submissions (id, name, email, phone, service, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, name, email, phone ?? null, service ?? null, message, source)
    .run();

  const payload: SubmissionPayload = {
    id, name, email, phone, service, message, source, created_at,
  };

  // Fire-and-forget — never block the response on email delivery.
  // Each function catches and logs its own errors; the route always returns 201.
  sendAdminNotification(payload);
  sendCustomerConfirmation(payload);

  return NextResponse.json({ success: true, id }, { status: 201 });
}
