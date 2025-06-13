const Database = require('better-sqlite3');
const db = new Database('./data/giveaways.db');

// Create tables with enhanced schema
db.prepare(`
  CREATE TABLE IF NOT EXISTS giveaways (
    message_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    end_time INTEGER NOT NULL,
    winners INTEGER NOT NULL DEFAULT 1,
    requirements TEXT,
    host_id TEXT NOT NULL,
    ended BOOLEAN NOT NULL DEFAULT 0
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS entries (
    message_id TEXT,
    user_id TEXT,
    entry_time INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES giveaways(message_id) ON DELETE CASCADE
  )
`).run();

// Create indexes for better performance
db.prepare('CREATE INDEX IF NOT EXISTS idx_giveaways_end_time ON giveaways(end_time)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_entries_message_id ON entries(message_id)').run();

module.exports = db;