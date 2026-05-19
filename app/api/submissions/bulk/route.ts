import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";

export const runtime = "nodejs";

type Action =
  | "mark_read"
  | "mark_unread"
  | "star"
  | "unstar"
  | "archive"
  | "unarchive"
  | "set_status"
  | "delete";

type Body = {
  ids: string[];
  action: Action;
  status?: string;
};

export async function POST(req: Request) {
  try { await requireAdmin(); } catch (res) { return res as NextResponse; }

  const body = (await req.json()) as Body;
  const { ids, action } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "no_ids" }, { status: 400 });
  }

  const placeholders = ids.map(() => "?").join(",");
  const db = getDB();

  switch (action) {
    case "mark_read":
      await db.prepare(`UPDATE form_submissions SET is_read = 1 WHERE id IN (${placeholders})`).bind(...ids).run();
      break;
    case "mark_unread":
      await db.prepare(`UPDATE form_submissions SET is_read = 0 WHERE id IN (${placeholders})`).bind(...ids).run();
      break;
    case "star":
      await db.prepare(`UPDATE form_submissions SET starred = 1 WHERE id IN (${placeholders})`).bind(...ids).run();
      break;
    case "unstar":
      await db.prepare(`UPDATE form_submissions SET starred = 0 WHERE id IN (${placeholders})`).bind(...ids).run();
      break;
    case "archive":
      await db.prepare(`UPDATE form_submissions SET archived = 1 WHERE id IN (${placeholders})`).bind(...ids).run();
      break;
    case "unarchive":
      await db.prepare(`UPDATE form_submissions SET archived = 0 WHERE id IN (${placeholders})`).bind(...ids).run();
      break;
    case "set_status":
      if (!body.status) return NextResponse.json({ error: "missing_status" }, { status: 400 });
      await db.prepare(`UPDATE form_submissions SET status = ? WHERE id IN (${placeholders})`).bind(body.status, ...ids).run();
      break;
    case "delete":
      await db.prepare(`DELETE FROM form_submissions WHERE id IN (${placeholders})`).bind(...ids).run();
      break;
    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, affected: ids.length });
}
