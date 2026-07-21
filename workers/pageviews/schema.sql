CREATE TABLE IF NOT EXISTS page_views (
  content_id TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at TEXT NOT NULL
);
