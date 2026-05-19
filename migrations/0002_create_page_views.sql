-- Page-view events emitted by the client beacon (AnalyticsTracker).
-- One row per navigation. country is null unless the deploy sits
-- behind a Cloudflare proxy populating cf-ipcountry.

CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  country TEXT,
  session_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path       ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_session    ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_country    ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_device     ON page_views(device_type);
