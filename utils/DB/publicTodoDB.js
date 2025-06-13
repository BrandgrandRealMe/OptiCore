const Database = require('better-sqlite3');
const db = new Database('./data/public_todos.db');

// Create public_todos table
db.prepare(`
  CREATE TABLE IF NOT EXISTS public_todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    task TEXT NOT NULL,
    due_date INTEGER, -- Unix timestamp (ms)
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    completed_at INTEGER
  )
`).run();

// Create index
db.prepare('CREATE INDEX IF NOT EXISTS idx_public_todos_user_id ON public_todos(user_id)').run();

module.exports = db;