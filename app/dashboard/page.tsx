import Link from "next/link";
import { getDB } from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import StatCard from "@/app/components/dashboard/StatCard";
import { PIPELINE_STATUSES, STATUS_COLORS, type PipelineStatus } from "@/app/lib/contact";

export const runtime = "nodejs";

type SubmissionRow = {
  id: string;
  name: string;
  email: string;
  service: string | null;
  status: string;
  starred: number;
  follow_up_date: string | null;
  created_at: string;
};

type Count = { c: number };

export default async function DashboardOverview() {
  await requireAdmin();
  const db = getDB();

  const [
    today,
    last30,
    unread,
    starred,
    pv7,
    pv7Unique,
    pipeline,
    dueFollowups,
    recent,
  ] = await Promise.all([
    db.prepare(
      "SELECT COUNT(*) AS c FROM form_submissions WHERE date(created_at) = date('now')",
    ).bind().first<Count>(),
    db.prepare(
      "SELECT COUNT(*) AS c FROM form_submissions WHERE created_at >= datetime('now','-30 day')",
    ).bind().first<Count>(),
    db.prepare(
      "SELECT COUNT(*) AS c FROM form_submissions WHERE is_read = 0 AND archived = 0",
    ).bind().first<Count>(),
    db.prepare(
      "SELECT COUNT(*) AS c FROM form_submissions WHERE starred = 1 AND archived = 0",
    ).bind().first<Count>(),
    db.prepare(
      "SELECT COUNT(*) AS c FROM page_views WHERE created_at >= datetime('now','-7 day')",
    ).bind().first<Count>(),
    db.prepare(
      "SELECT COUNT(DISTINCT session_id) AS c FROM page_views WHERE created_at >= datetime('now','-7 day')",
    ).bind().first<Count>(),
    db.prepare(
      "SELECT status, COUNT(*) AS c FROM form_submissions WHERE archived = 0 GROUP BY status",
    ).bind().all<{ status: string; c: number }>(),
    db.prepare(
      `SELECT id, name, email, service, status, starred, follow_up_date, created_at
       FROM form_submissions
       WHERE follow_up_date IS NOT NULL AND archived = 0
         AND date(follow_up_date) <= date('now')
       ORDER BY follow_up_date ASC LIMIT 8`,
    ).bind().all<SubmissionRow>(),
    db.prepare(
      `SELECT id, name, email, service, status, starred, follow_up_date, created_at
       FROM form_submissions WHERE archived = 0
       ORDER BY created_at DESC LIMIT 6`,
    ).bind().all<SubmissionRow>(),
  ]);

  const pipelineMap = new Map<string, number>(pipeline.results.map((r) => [r.status, r.c]));
  const pipelineMax = Math.max(1, ...pipelineMap.values());

  return (
    <div className="space-y-12">
      <header>
        <div className="eyebrow">§ Overview</div>
        <h1 className="mt-2 font-display font-extralight text-4xl md:text-5xl tracking-[-0.04em] text-bone">
          The desk, at a glance.
        </h1>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Today" value={today?.c ?? 0} sublabel="New submissions" />
        <StatCard label="Last 30 days" value={last30?.c ?? 0} sublabel="Total submissions" />
        <StatCard label="Unread" value={unread?.c ?? 0} sublabel="Needs attention" />
        <StatCard label="Starred" value={starred?.c ?? 0} sublabel="Priority leads" />
        <StatCard label="Page views" value={pv7?.c ?? 0} sublabel="Last 7 days" />
        <StatCard label="Unique visitors" value={pv7Unique?.c ?? 0} sublabel="Last 7 days" />
      </section>

      <section className="space-y-5">
        <div className="eyebrow">§ Pipeline</div>
        <div className="frame p-5 md:p-7">
          <span className="frame-tr" />
          <span className="frame-bl" />
          <div className="flex flex-col gap-3">
            {PIPELINE_STATUSES.map((s) => {
              const count = pipelineMap.get(s) ?? 0;
              const width = (count / pipelineMax) * 100;
              return (
                <div key={s} className="flex items-center gap-4">
                  <div className="w-32 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-bone/55">
                    {s}
                  </div>
                  <div className="flex-1 h-3 bg-ink-soft relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${width}%`, background: STATUS_COLORS[s as PipelineStatus] }}
                    />
                  </div>
                  <div className="w-10 text-right font-display text-base serif-nums text-bone tracking-[-0.01em]">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="eyebrow">§ Follow-ups due</div>
          <Link href="/dashboard/submissions?tab=follow-up" className="btn-ghost">
            All →
          </Link>
        </div>
        {dueFollowups.results.length === 0 ? (
          <p className="font-display text-lg text-bone/45 italic font-light">Nothing due today.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {dueFollowups.results.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/dashboard/submissions?id=${row.id}`}
                  className="flex items-center justify-between py-4 group"
                >
                  <div>
                    <div className="font-display text-lg text-bone tracking-[-0.01em] group-hover:text-gold transition-colors">
                      {row.starred ? "★ " : ""}
                      {row.name}
                    </div>
                    <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-bone/45 mt-1">
                      {row.email} · {row.service ?? "—"}
                    </div>
                  </div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-gold/70">
                    due {row.follow_up_date?.slice(0, 10)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="eyebrow">§ Recent</div>
          <Link href="/dashboard/submissions" className="btn-ghost">
            All submissions →
          </Link>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {recent.results.map((row) => (
            <li key={row.id}>
              <Link
                href={`/dashboard/submissions?id=${row.id}`}
                className="flex items-center justify-between py-4 group"
              >
                <div>
                  <div className="font-display text-lg text-bone tracking-[-0.01em] group-hover:text-gold transition-colors">
                    {row.starred ? "★ " : ""}
                    {row.name}
                  </div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-bone/45 mt-1">
                    {row.email} · {row.service ?? "—"} · {row.status}
                  </div>
                </div>
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/35">
                  {row.created_at.slice(5, 16).replace("T", " ")}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
