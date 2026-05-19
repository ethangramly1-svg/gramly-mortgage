import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";

export const runtime = "nodejs";

type Submission = Record<string, unknown>;

const SORT_KEYS = new Set([
  "created_at", "name", "email", "status", "starred", "follow_up_date", "estimated_value",
]);

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const url = new URL(req.url);
  const q = url.searchParams;

  const tab = q.get("tab") ?? "all";
  const service = q.get("service");
  const source = q.get("source");
  const status = q.get("status");
  const dateFrom = q.get("from");
  const dateTo = q.get("to");
  const search = (q.get("q") ?? "").trim();
  const sortBy = SORT_KEYS.has(q.get("sortBy") ?? "") ? (q.get("sortBy") as string) : "created_at";
  const sortDir = q.get("sortDir") === "asc" ? "ASC" : "DESC";
  const page = Math.max(1, parseInt(q.get("page") ?? "1"));
  const pageSize = Math.min(200, Math.max(1, parseInt(q.get("pageSize") ?? "50")));

  const where: string[] = [];
  const args: (string | number)[] = [];

  if (tab === "unread") where.push("is_read = 0 AND archived = 0");
  else if (tab === "starred") where.push("starred = 1 AND archived = 0");
  else if (tab === "follow-up") where.push("follow_up_date IS NOT NULL AND archived = 0");
  else if (tab === "archived") where.push("archived = 1");
  else where.push("archived = 0");

  if (service) { where.push("service = ?"); args.push(service); }
  if (source)  { where.push("source = ?");  args.push(source); }
  if (status)  { where.push("status = ?");  args.push(status); }
  if (dateFrom) { where.push("created_at >= ?"); args.push(dateFrom); }
  if (dateTo)   { where.push("created_at <= ?"); args.push(dateTo); }
  if (search) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)");
    const s = `%${search}%`;
    args.push(s, s, s, s);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;

  const db = getDB();

  const { results: items } = await db
    .prepare(
      `SELECT * FROM form_submissions
       ${whereSql}
       ORDER BY ${sortBy} ${sortDir}
       LIMIT ? OFFSET ?`,
    )
    .bind(...args, pageSize, offset)
    .all<Submission>();

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS c FROM form_submissions ${whereSql}`)
    .bind(...args)
    .first<{ c: number }>();

  const counts = await Promise.all([
    db.prepare("SELECT COUNT(*) AS c FROM form_submissions WHERE archived = 0").bind().first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM form_submissions WHERE is_read = 0 AND archived = 0").bind().first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM form_submissions WHERE starred = 1 AND archived = 0").bind().first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM form_submissions WHERE follow_up_date IS NOT NULL AND archived = 0").bind().first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM form_submissions WHERE archived = 1").bind().first<{ c: number }>(),
  ]);

  return NextResponse.json({
    items,
    total: totalRow?.c ?? 0,
    page,
    pageSize,
    counts: {
      all: counts[0]?.c ?? 0,
      unread: counts[1]?.c ?? 0,
      starred: counts[2]?.c ?? 0,
      followUp: counts[3]?.c ?? 0,
      archived: counts[4]?.c ?? 0,
    },
  });
}
