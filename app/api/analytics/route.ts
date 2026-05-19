import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";

export const runtime = "nodejs";

type Filters = {
  from: string;
  to: string;
  page?: string;
  referrer?: string;
  device?: string;
  country?: string;
};

function periodToRange(period: string): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  if (period === "7d") from.setDate(to.getDate() - 7);
  else if (period === "90d") from.setDate(to.getDate() - 90);
  else from.setDate(to.getDate() - 30);
  return { from: from.toISOString(), to: to.toISOString() };
}

function buildWhere(f: Filters): { sql: string; args: (string | number)[] } {
  const where: string[] = ["created_at >= ?", "created_at <= ?"];
  const args: (string | number)[] = [f.from, f.to];
  if (f.page) { where.push("path = ?"); args.push(f.page); }
  if (f.referrer) { where.push("referrer LIKE ?"); args.push(`%${f.referrer}%`); }
  if (f.device) { where.push("device_type = ?"); args.push(f.device); }
  if (f.country) { where.push("country = ?"); args.push(f.country); }
  return { sql: `WHERE ${where.join(" AND ")}`, args };
}

export async function GET(req: Request) {
  try { await requireAdmin(); } catch (res) { return res as NextResponse; }

  const url = new URL(req.url);
  const q = url.searchParams;

  let from = q.get("from");
  let to = q.get("to");
  if (!from || !to) {
    const range = periodToRange(q.get("period") ?? "30d");
    from = range.from;
    to = range.to;
  }

  const filters: Filters = {
    from,
    to,
    page: q.get("page") || undefined,
    referrer: q.get("referrer") || undefined,
    device: q.get("device") || undefined,
    country: q.get("country") || undefined,
  };
  const { sql: whereSql, args } = buildWhere(filters);
  const db = getDB();

  // Summary cards.
  const totals = await db
    .prepare(
      `SELECT
        COUNT(*) AS views,
        COUNT(DISTINCT session_id) AS visitors,
        COUNT(DISTINCT path) AS pages_visited
       FROM page_views ${whereSql}`,
    )
    .bind(...args)
    .first<{ views: number; visitors: number; pages_visited: number }>();

  // Previous period for % change.
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const spanMs = toDate.getTime() - fromDate.getTime();
  const prevFrom = new Date(fromDate.getTime() - spanMs).toISOString();
  const prevTo = from;
  const prev = await db
    .prepare(
      `SELECT COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors
       FROM page_views WHERE created_at >= ? AND created_at <= ?`,
    )
    .bind(prevFrom, prevTo)
    .first<{ views: number; visitors: number }>();

  // Daily traffic.
  const { results: daily } = await db
    .prepare(
      `SELECT DATE(created_at) AS day, COUNT(*) AS views,
              COUNT(DISTINCT session_id) AS visitors
       FROM page_views ${whereSql}
       GROUP BY DATE(created_at) ORDER BY day ASC`,
    )
    .bind(...args)
    .all<{ day: string; views: number; visitors: number }>();

  // Hour of day.
  const { results: hourly } = await db
    .prepare(
      `SELECT CAST(strftime('%H', created_at) AS INTEGER) AS hour,
              COUNT(*) AS views
       FROM page_views ${whereSql}
       GROUP BY hour ORDER BY hour ASC`,
    )
    .bind(...args)
    .all<{ hour: number; views: number }>();

  const { results: topPages } = await db
    .prepare(
      `SELECT path, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors
       FROM page_views ${whereSql}
       GROUP BY path ORDER BY views DESC LIMIT 10`,
    )
    .bind(...args)
    .all<{ path: string; views: number; visitors: number }>();

  const { results: topReferrers } = await db
    .prepare(
      `SELECT referrer, COUNT(*) AS views
       FROM page_views ${whereSql} AND referrer IS NOT NULL AND referrer != ''
       GROUP BY referrer ORDER BY views DESC LIMIT 10`,
    )
    .bind(...args)
    .all<{ referrer: string; views: number }>();

  const { results: devices } = await db
    .prepare(
      `SELECT device_type, COUNT(*) AS views
       FROM page_views ${whereSql}
       GROUP BY device_type ORDER BY views DESC`,
    )
    .bind(...args)
    .all<{ device_type: string; views: number }>();

  const { results: countries } = await db
    .prepare(
      `SELECT country, COUNT(*) AS views
       FROM page_views ${whereSql} AND country IS NOT NULL
       GROUP BY country ORDER BY views DESC LIMIT 10`,
    )
    .bind(...args)
    .all<{ country: string; views: number }>();

  const days = Math.max(1, Math.ceil(spanMs / 86400000));
  const avgPerDay = Math.round((totals?.views ?? 0) / days);

  function pctChange(curr: number, prev: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }

  return NextResponse.json({
    range: { from, to },
    summary: {
      totalViews: totals?.views ?? 0,
      uniqueVisitors: totals?.visitors ?? 0,
      avgPerDay,
      pagesVisited: totals?.pages_visited ?? 0,
      viewsChange: pctChange(totals?.views ?? 0, prev?.views ?? 0),
      visitorsChange: pctChange(totals?.visitors ?? 0, prev?.visitors ?? 0),
    },
    daily,
    hourly,
    topPages,
    topReferrers,
    devices,
    countries,
  });
}
