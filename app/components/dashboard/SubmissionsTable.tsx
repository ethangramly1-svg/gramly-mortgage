"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PIPELINE_STATUSES, STATUS_COLORS, type PipelineStatus } from "@/app/lib/contact";

type Submission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  source: string;
  status: string;
  starred: number;
  notes: string | null;
  follow_up_date: string | null;
  last_contacted: string | null;
  estimated_value: number | null;
  tags: string | null;
  is_read: number;
  archived: number;
  created_at: string;
};

type Counts = { all: number; unread: number; starred: number; followUp: number; archived: number };
type Tab = "all" | "unread" | "starred" | "follow-up" | "archived";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "starred", label: "Starred" },
  { id: "follow-up", label: "Follow-up" },
  { id: "archived", label: "Archived" },
];

export default function SubmissionsTable() {
  const [items, setItems] = useState<Submission[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, unread: 0, starred: 0, followUp: 0, archived: 0 });
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ tab });
    if (search.trim()) params.set("q", search.trim());
    if (serviceFilter) params.set("service", serviceFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/submissions?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items as Submission[]);
      setCounts(data.counts as Counts);
    }
    setLoading(false);
  }, [tab, search, serviceFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateItem = useCallback(async (id: string, patch: Partial<Submission>) => {
    // Optimistic.
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) load();
  }, [load]);

  const deleteItem = useCallback(async (id: string) => {
    if (!confirm("Delete permanently?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    load();
  }, [load]);

  const bulk = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    await fetch("/api/submissions/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action, ...extra }),
    });
    setSelected(new Set());
    load();
  }, [selected, load]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = items.length > 0 && items.every((it) => selected.has(it.id));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allSelected) return new Set();
      const next = new Set(prev);
      items.forEach((it) => next.add(it.id));
      return next;
    });
  };

  const services = useMemo(
    () => Array.from(new Set(items.map((it) => it.service).filter(Boolean))) as string[],
    [items],
  );

  const exportUrl = useMemo(() => "/api/submissions/export?format=csv", []);

  return (
    <div className="space-y-7">
      {/* Tabs */}
      <div className="flex flex-wrap items-end gap-1 border-b border-line">
        {TABS.map((t) => {
          const count = t.id === "all" ? counts.all : t.id === "unread" ? counts.unread :
            t.id === "starred" ? counts.starred : t.id === "follow-up" ? counts.followUp : counts.archived;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelected(new Set()); }}
              className={`px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] transition-colors border-b-2 -mb-px ${
                active ? "text-gold border-gold" : "text-bone/55 hover:text-bone border-transparent"
              }`}
            >
              {t.label}{" "}
              <span className={active ? "text-gold/70" : "text-bone/30"}>
                · {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, message…"
          className="input-field !py-2 !text-sm flex-1 min-w-[220px]"
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="input-field !py-2 !text-sm w-auto"
        >
          <option value="">All services</option>
          {services.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field !py-2 !text-sm w-auto"
        >
          <option value="">All statuses</option>
          {PIPELINE_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <a href={exportUrl} className="btn-ghost">Export CSV ↗</a>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 frame p-4">
          <span className="frame-tr" /><span className="frame-bl" />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-gold">
            {selected.size} selected
          </span>
          <button onClick={() => bulk("mark_read")} className="btn-ghost">Mark read</button>
          <button onClick={() => bulk("mark_unread")} className="btn-ghost">Mark unread</button>
          <button onClick={() => bulk("star")} className="btn-ghost">Star</button>
          <button onClick={() => bulk("unstar")} className="btn-ghost">Unstar</button>
          <button onClick={() => bulk(tab === "archived" ? "unarchive" : "archive")} className="btn-ghost">
            {tab === "archived" ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${selected.size} permanently?`)) bulk("delete");
            }}
            className="btn-ghost text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="border-y border-line">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-line font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/40">
          <div className="col-span-1 flex items-center">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
          </div>
          <div className="col-span-3">Name · Email</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Follow-up</div>
          <div className="col-span-2 text-right">Received</div>
        </div>

        {loading && items.length === 0 ? (
          <div className="px-4 py-12 text-center font-display text-bone/45 italic font-light">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center font-display text-bone/45 italic font-light">No submissions in this view.</div>
        ) : (
          items.map((it) => {
            const isExpanded = expandedId === it.id;
            const isSelected = selected.has(it.id);
            return (
              <div key={it.id} className={`border-b border-line ${it.is_read ? "" : "bg-ink-soft/40"}`}>
                <div
                  className="grid grid-cols-12 gap-3 px-4 py-4 items-center cursor-pointer group hover:bg-ink-soft/30"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : it.id);
                    if (!it.is_read && !isExpanded) updateItem(it.id, { is_read: 1 });
                  }}
                >
                  <div className="col-span-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(it.id)}
                      aria-label={`Select ${it.name}`}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); updateItem(it.id, { starred: it.starred ? 0 : 1 }); }}
                      className={it.starred ? "text-gold" : "text-bone/30 hover:text-gold"}
                      aria-label={it.starred ? "Unstar" : "Star"}
                    >
                      ★
                    </button>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <div className="font-display text-base text-bone tracking-[-0.01em] truncate group-hover:text-gold transition-colors">
                      {it.name}
                    </div>
                    <div className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/45 truncate">
                      {it.email}
                    </div>
                  </div>
                  <div className="col-span-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-bone/65 truncate">
                    {it.service ?? "—"}
                  </div>
                  <div className="col-span-2">
                    <span
                      className="inline-block font-mono text-[0.56rem] uppercase tracking-[0.18em] px-2 py-1"
                      style={{
                        color: STATUS_COLORS[it.status as PipelineStatus] ?? "#9ca3af",
                        backgroundColor: (STATUS_COLORS[it.status as PipelineStatus] ?? "#9ca3af") + "1a",
                      }}
                    >
                      {it.status}
                    </span>
                  </div>
                  <div className="col-span-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-bone/55">
                    {it.follow_up_date ? it.follow_up_date.slice(0, 10) : "—"}
                  </div>
                  <div className="col-span-2 text-right font-mono text-[0.55rem] uppercase tracking-[0.18em] text-bone/35">
                    {it.created_at.slice(5, 16).replace("T", " ")}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-6 pt-2 space-y-5 bg-ink-soft/40" onClick={(e) => e.stopPropagation()}>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <div className="eyebrow-sm">Message</div>
                        <p className="font-body text-bone/85 text-sm leading-[1.7] whitespace-pre-wrap">{it.message}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="eyebrow-sm">CRM</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/45">Status</label>
                          <select
                            value={it.status}
                            onChange={(e) => updateItem(it.id, { status: e.target.value })}
                            className="input-field !py-1 !text-xs w-auto"
                          >
                            {PIPELINE_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/45">Follow-up</label>
                          <input
                            type="date"
                            value={it.follow_up_date?.slice(0, 10) ?? ""}
                            onChange={(e) => updateItem(it.id, { follow_up_date: e.target.value || null })}
                            className="input-field !py-1 !text-xs w-auto"
                          />
                          <button
                            onClick={() => updateItem(it.id, { follow_up_date: new Date().toISOString().slice(0, 10) })}
                            className="btn-ghost"
                          >
                            Today
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/45">Est. value</label>
                          <input
                            type="number"
                            defaultValue={it.estimated_value ?? ""}
                            onBlur={(e) => updateItem(it.id, { estimated_value: e.target.value ? Number(e.target.value) : null })}
                            placeholder="$"
                            className="input-field !py-1 !text-xs w-32"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/45">Notes (private)</label>
                          <textarea
                            defaultValue={it.notes ?? ""}
                            onBlur={(e) => updateItem(it.id, { notes: e.target.value || null })}
                            rows={3}
                            className="input-field !text-sm resize-none"
                            placeholder="Internal notes — only you see these"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-line">
                      <a href={`mailto:${it.email}`} className="btn-ghost">Email →</a>
                      {it.phone && (
                        <a href={`tel:${it.phone}`} className="btn-ghost">Call →</a>
                      )}
                      <button onClick={() => updateItem(it.id, { is_read: it.is_read ? 0 : 1 })} className="btn-ghost">
                        Mark {it.is_read ? "unread" : "read"}
                      </button>
                      <button onClick={() => updateItem(it.id, { archived: it.archived ? 0 : 1 })} className="btn-ghost">
                        {it.archived ? "Unarchive" : "Archive"}
                      </button>
                      <button onClick={() => deleteItem(it.id)} className="btn-ghost text-red-400 hover:text-red-300">
                        Delete
                      </button>
                      <div className="ml-auto font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/35">
                        ID {it.id.slice(0, 8)} · via {it.source}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
