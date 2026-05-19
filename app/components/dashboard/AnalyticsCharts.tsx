"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { pageNameFor } from "@/app/lib/page-names";

type AnalyticsResponse = {
  range: { from: string; to: string };
  summary: {
    totalViews: number;
    uniqueVisitors: number;
    avgPerDay: number;
    pagesVisited: number;
    viewsChange: number;
    visitorsChange: number;
  };
  daily: Array<{ day: string; views: number; visitors: number }>;
  hourly: Array<{ hour: number; views: number }>;
  topPages: Array<{ path: string; views: number; visitors: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  devices: Array<{ device_type: string; views: number }>;
  countries: Array<{ country: string; views: number }>;
};

type Period = "7d" | "30d" | "90d";
type Filters = { page?: string; referrer?: string; device?: string; country?: string };

function cleanReferrer(ref: string): string {
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref || "direct";
  }
}

export default function AnalyticsCharts() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (filters.page) params.set("page", filters.page);
    if (filters.referrer) params.set("referrer", filters.referrer);
    if (filters.device) params.set("device", filters.device);
    if (filters.country) params.set("country", filters.country);
    const res = await fetch(`/api/analytics?${params}`);
    if (res.ok) setData((await res.json()) as AnalyticsResponse);
    setLoading(false);
  }, [period, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const dailyMax = useMemo(
    () => Math.max(1, ...(data?.daily.map((d) => d.views) ?? [1])),
    [data],
  );
  const hourlyMax = useMemo(
    () => Math.max(1, ...(data?.hourly.map((h) => h.views) ?? [1])),
    [data],
  );
  const hourly24 = useMemo(() => {
    const arr: number[] = Array(24).fill(0);
    data?.hourly.forEach((h) => { arr[h.hour] = h.views; });
    return arr;
  }, [data]);

  const setFilter = (key: keyof Filters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  };

  const activeFilterChips = Object.entries(filters).filter(([, v]) => Boolean(v)) as Array<[keyof Filters, string]>;

  return (
    <div className="space-y-10">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {(["7d", "30d", "90d"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`font-mono text-[0.62rem] uppercase tracking-[0.22em] px-3 py-2 transition-colors ${
              period === p ? "text-gold border border-gold" : "text-bone/55 hover:text-bone border border-line"
            }`}
          >
            {p}
          </button>
        ))}
        <button onClick={load} className="btn-ghost ml-auto">Refresh ↻</button>
      </div>

      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.map(([k, v]) => (
            <button
              key={k}
              onClick={() => setFilters((p) => ({ ...p, [k]: undefined }))}
              className="font-mono text-[0.55rem] uppercase tracking-[0.22em] px-3 py-1 border border-gold/50 text-gold hover:bg-gold/10"
            >
              {k}: {v} ×
            </button>
          ))}
          <button
            onClick={() => setFilters({})}
            className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/45 hover:text-bone"
          >
            Clear all
          </button>
        </div>
      )}

      {loading && !data ? (
        <p className="font-display text-bone/45 italic font-light">Loading analytics…</p>
      ) : !data ? (
        <p className="font-display text-bone/45 italic font-light">No data.</p>
      ) : (
        <>
          {/* Summary cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Page views" value={data.summary.totalViews} change={data.summary.viewsChange} />
            <SummaryCard label="Unique visitors" value={data.summary.uniqueVisitors} change={data.summary.visitorsChange} />
            <SummaryCard label="Avg / day" value={data.summary.avgPerDay} />
            <SummaryCard label="Pages visited" value={data.summary.pagesVisited} />
          </section>

          {/* Daily traffic */}
          <section className="space-y-4">
            <div className="eyebrow">§ Daily traffic</div>
            <div className="frame p-5">
              <span className="frame-tr" /><span className="frame-bl" />
              <div className="flex items-end gap-1 h-44">
                {data.daily.map((d) => (
                  <div key={d.day} className="flex-1 group relative" title={`${d.day}: ${d.views} views`}>
                    <div
                      className="w-full bg-gradient-to-t from-gold-deep to-gold transition-opacity group-hover:opacity-80"
                      style={{ height: `${(d.views / dailyMax) * 100}%` }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[0.55rem] uppercase tracking-[0.18em] text-bone/85 bg-ink-soft px-2 py-1 whitespace-nowrap">
                      {d.views}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Hourly */}
          <section className="space-y-4">
            <div className="eyebrow">§ Traffic by hour</div>
            <div className="frame p-5">
              <span className="frame-tr" /><span className="frame-bl" />
              <div className="flex items-end gap-1 h-32">
                {hourly24.map((v, h) => (
                  <div key={h} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-gold/60 group-hover:bg-gold transition-colors"
                        style={{ height: `${(v / hourlyMax) * 100}%` }}
                      />
                    </div>
                    <div className="font-mono text-[0.5rem] text-bone/35">{String(h).padStart(2, "0")}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Top pages + Top referrers */}
          <section className="grid md:grid-cols-2 gap-6">
            <RankedList
              title="Top pages"
              rows={data.topPages.map((p) => ({ label: pageNameFor(p.path), sub: p.path, value: p.views }))}
              onClick={(_label, sub) => setFilter("page", sub)}
              activeId={filters.page}
              idGetter={(_label, sub) => sub}
            />
            <RankedList
              title="Top referrers"
              rows={data.topReferrers.map((r) => ({ label: cleanReferrer(r.referrer), sub: r.referrer, value: r.views }))}
              onClick={(_label, sub) => setFilter("referrer", cleanReferrer(sub))}
              activeId={filters.referrer}
              idGetter={(label) => label}
            />
          </section>

          {/* Devices + Countries */}
          <section className="grid md:grid-cols-2 gap-6">
            <DeviceChart
              devices={data.devices}
              activeFilter={filters.device}
              onClick={(d) => setFilter("device", d)}
            />
            <RankedList
              title="Top countries"
              rows={data.countries.map((c) => ({ label: c.country, value: c.views }))}
              onClick={(label) => setFilter("country", label)}
              activeId={filters.country}
              idGetter={(label) => label}
            />
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, change }: { label: string; value: number; change?: number }) {
  const trendColor =
    change == null ? "" : change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-bone/40";
  return (
    <div className="frame p-5">
      <span className="frame-tr" /><span className="frame-bl" />
      <div className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-bone/45 mb-3">{label}</div>
      <div className="font-display font-light text-3xl md:text-4xl tracking-[-0.025em] serif-nums text-bone">
        {value.toLocaleString()}
      </div>
      {change != null && (
        <div className={`mt-2 font-mono text-[0.6rem] tracking-[0.18em] ${trendColor}`}>
          {change > 0 ? "▲" : change < 0 ? "▼" : "·"} {Math.abs(change)}% vs prev
        </div>
      )}
    </div>
  );
}

function RankedList({
  title,
  rows,
  onClick,
  activeId,
  idGetter,
}: {
  title: string;
  rows: Array<{ label: string; sub?: string; value: number }>;
  onClick: (label: string, sub: string) => void;
  activeId?: string;
  idGetter: (label: string, sub: string) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-3">
      <div className="eyebrow">§ {title}</div>
      <div className="frame p-5">
        <span className="frame-tr" /><span className="frame-bl" />
        {rows.length === 0 ? (
          <p className="font-display text-bone/45 italic font-light">No data.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r, i) => {
              const id = idGetter(r.label, r.sub ?? r.label);
              const active = activeId === id;
              return (
                <li key={`${r.label}-${i}`}>
                  <button
                    onClick={() => onClick(r.label, r.sub ?? r.label)}
                    className="w-full block group"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0 flex-1 text-left">
                        <div className={`font-display text-base truncate transition-colors ${active ? "text-gold" : "text-bone group-hover:text-gold"}`}>
                          {r.label}
                        </div>
                        {r.sub && r.sub !== r.label && (
                          <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/35 truncate">{r.sub}</div>
                        )}
                      </div>
                      <div className="font-display text-base serif-nums text-bone tracking-[-0.01em]">{r.value.toLocaleString()}</div>
                    </div>
                    <div className="h-px bg-line mt-2 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-deep to-gold"
                        style={{ width: `${(r.value / max) * 100}%` }}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function DeviceChart({
  devices,
  activeFilter,
  onClick,
}: {
  devices: Array<{ device_type: string; views: number }>;
  activeFilter?: string;
  onClick: (d: string) => void;
}) {
  const total = devices.reduce((acc, d) => acc + d.views, 0);
  const COLORS: Record<string, string> = {
    desktop: "#d4b46a",
    mobile: "#a08eff",
    tablet: "#4fd1c5",
  };
  return (
    <div className="space-y-3">
      <div className="eyebrow">§ Devices</div>
      <div className="frame p-5">
        <span className="frame-tr" /><span className="frame-bl" />
        {total === 0 ? (
          <p className="font-display text-bone/45 italic font-light">No data.</p>
        ) : (
          <>
            <div className="flex h-4 mb-5">
              {devices.map((d) => (
                <button
                  key={d.device_type}
                  onClick={() => onClick(d.device_type)}
                  title={`${d.device_type}: ${d.views}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    width: `${(d.views / total) * 100}%`,
                    background: COLORS[d.device_type] ?? "#9ca3af",
                  }}
                />
              ))}
            </div>
            <ul className="space-y-2">
              {devices.map((d) => {
                const active = activeFilter === d.device_type;
                return (
                  <li key={d.device_type}>
                    <button
                      onClick={() => onClick(d.device_type)}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 inline-block"
                          style={{ background: COLORS[d.device_type] ?? "#9ca3af" }}
                        />
                        <span className={`font-mono text-[0.62rem] uppercase tracking-[0.22em] ${active ? "text-gold" : "text-bone/65"}`}>
                          {d.device_type}
                        </span>
                      </span>
                      <span className="font-display text-base serif-nums text-bone">
                        {Math.round((d.views / total) * 100)}%
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
