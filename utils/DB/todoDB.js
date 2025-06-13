const Database = require('better-sqlite3');
const db = new Database('./data/todos.db');

// Create todos table
db.prepare(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id TEXT NOT NULL,
    task TEXT NOT NULL,
    due_date INTEGER, -- Unix timestamp (ms)
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    completed_at INTEGER
  )
`).run();

// Create index
db.prepare('CREATE INDEX IF NOT EXISTS idx_todos_owner_id ON todos(owner_id)').run();

module.exports = db;