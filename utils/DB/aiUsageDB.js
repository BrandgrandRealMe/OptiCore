const Database = require('better-sqlite3');
const db = new Database('./data/ai_usage.db');

// Create ai_usage table
db.prepare(`
  CREATE TABLE IF NOT EXISTS ai_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    image_url TEXT,
    request_time INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    success BOOLEAN NOT NULL,
    error_message TEXT
  )
`).run();

// Create index
db.prepare('CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id)').run();

module.exports = db;