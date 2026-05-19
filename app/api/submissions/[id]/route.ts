import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";

export const runtime = "nodejs";

const UPDATABLE = new Set([
  "status",
  "starred",
  "notes",
  "follow_up_date",
  "last_contacted",
  "estimated_value",
  "tags",
  "is_read",
  "archived",
]);

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch (res) { return res as NextResponse; }
  const { id } = await ctx.params;
  const row = await getDB()
    .prepare("SELECT * FROM form_submissions WHERE id = ?")
    .bind(id)
    .first();
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch (res) { return res as NextResponse; }
  const { id } = await ctx.params;
  const body = (await req.json()) as Record<string, unknown>;

  const sets: string[] = [];
  const args: (string | number | null)[] = [];
  for (const [key, val] of Object.entries(body)) {
    if (!UPDATABLE.has(key)) continue;
    sets.push(`${key} = ?`);
    args.push(val as string | number | null);
  }
  if (sets.length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }
  args.push(id);

  await getDB()
    .prepare(`UPDATE form_submissions SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...args)
    .run();

  const row = await getDB()
    .prepare("SELECT * FROM form_submissions WHERE id = ?")
    .bind(id)
    .first();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch (res) { return res as NextResponse; }
  const { id } = await ctx.params;
  await getDB().prepare("DELETE FROM form_submissions WHERE id = ?").bind(id).run();
  return NextResponse.json({ ok: true });
}
