import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";

export const runtime = "nodejs";

const COLUMNS = [
  "id", "name", "email", "phone", "service", "message",
  "source", "status", "starred", "notes", "follow_up_date",
  "last_contacted", "estimated_value", "tags", "is_read",
  "archived", "created_at",
];

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  try { await requireAdmin(); } catch (res) { return res as NextResponse; }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const includeArchived = url.searchParams.get("archived") === "true";

  const { results } = await getDB()
    .prepare(
      `SELECT * FROM form_submissions
       ${includeArchived ? "" : "WHERE archived = 0"}
       ORDER BY created_at DESC`,
    )
    .bind()
    .all<Record<string, unknown>>();

  if (format === "json") {
    return NextResponse.json(results, {
      headers: {
        "Content-Disposition": `attachment; filename="submissions-${Date.now()}.json"`,
      },
    });
  }

  const header = COLUMNS.join(",");
  const body = results
    .map((row) => COLUMNS.map((c) => csvEscape(row[c])).join(","))
    .join("\n");
  const csv = `${header}\n${body}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="submissions-${Date.now()}.csv"`,
    },
  });
}
