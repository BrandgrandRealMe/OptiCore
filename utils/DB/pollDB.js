const Database = require('better-sqlite3');
const db = new Database('./data/polls.db');

// Create polls tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS polls (
    message_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON string of options
    end_time INTEGER NOT NULL,
    host_id TEXT NOT NULL,
    ended BOOLEAN NOT NULL DEFAULT 0
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS poll_votes (
    message_id TEXT,
    user_id TEXT,
    option_index INTEGER NOT NULL,
    vote_time INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES polls(message_id) ON DELETE CASCADE
  )
`).run();

// Create indexes
db.prepare('CREATE INDEX IF NOT EXISTS idx_polls_end_time ON polls(end_time)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_poll_votes_message_id ON poll_votes(message_id)').run();

module.exports = db;