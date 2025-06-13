const Database = require('better-sqlite3');
const db = new Database('./data/reminders.db');

// Create reminders table
db.prepare(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    due_time INTEGER NOT NULL, -- Unix timestamp (ms)
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    sent BOOLEAN NOT NULL DEFAULT 0
  )
`).run();

// Create index
db.prepare('CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_reminders_due_time ON reminders(due_time)').run();

module.exports = db;