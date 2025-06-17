const Database = require('better-sqlite3');
const db = new Database('./data/welcome.db');

// Create welcome_settings table
db.prepare(`
  CREATE TABLE IF NOT EXISTS welcome_settings (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('image', 'embed', 'normal')),
    content TEXT, -- Optional title for image, message for embed/normal
    enabled BOOLEAN NOT NULL DEFAULT 1
  )
`).run();

// Create index
db.prepare('CREATE INDEX IF NOT EXISTS idx_welcome_guild_id ON welcome_settings(guild_id)').run();

module.exports = db;