-- Pre-aggregation table for daily roll-ups. Unused now; future
-- scheduled job will populate this so the analytics dashboard can
-- read pre-computed daily totals instead of grouping page_views
-- at request time once volume justifies it.

CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY,
  page_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  submissions INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
