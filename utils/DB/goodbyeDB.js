const Database = require('better-sqlite3');
const db = new Database('./data/goodbye.db');

// Create goodbye_settings table
db.prepare(`
  CREATE TABLE IF NOT EXISTS goodbye_settings (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('image', 'embed', 'normal')),
    content TEXT, -- Optional title for image, message for embed/normal
    enabled BOOLEAN NOT NULL DEFAULT 1
  )
`).run();

// Create index
db.prepare('CREATE INDEX IF NOT EXISTS idx_goodbye_guild_id ON goodbye_settings(guild_id)').run();

module.exports = db;