-- Contact form submissions + lightweight CRM state.
-- Authored alongside the CRM fields from the start (the reference
-- shipped CRM later as 0004; 0004 is a no-op here for tracking parity).

CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'home',
  status TEXT NOT NULL DEFAULT 'new',
  starred INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  follow_up_date TEXT,
  last_contacted TEXT,
  estimated_value INTEGER,
  tags TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_status     ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_is_read    ON form_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_submissions_archived   ON form_submissions(archived);
CREATE INDEX IF NOT EXISTS idx_submissions_starred    ON form_submissions(starred);
