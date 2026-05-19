import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { randomId } from "@/app/lib/analytics";

export const runtime = "nodejs";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  source?: "home" | "contact";
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

  const db = getDB();
  const id = randomId();
  await db
    .prepare(
      `INSERT INTO form_submissions (id, name, email, phone, service, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      name,
      email,
      (body.phone ?? "").trim() || null,
      (body.service ?? "").trim() || null,
      message,
      body.source === "contact" ? "contact" : "home",
    )
    .run();

  // TODO phase 10: send admin notification + customer confirmation emails via Resend
  return NextResponse.json({ success: true, id }, { status: 201 });
}
