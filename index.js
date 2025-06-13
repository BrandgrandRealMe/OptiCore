const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config/settings.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Recursive command loader with category support
function loadCommandsFromDir(dirPath, baseCategory = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const newCategory = baseCategory ? `${baseCategory}/${entry.name}` : entry.name;
      loadCommandsFromDir(fullPath, newCategory);
    } else if (entry.name.endsWith('.js')) {
      const command = require(path.resolve(fullPath));
      if ('data' in command && 'execute' in command) {
        const category = baseCategory || 'Uncategorized';
        client.commands.set(command.data.name, {
          ...command,
          category
        });
        console.log(`✅ Loaded: [${category}] /${command.data.name}`);
      } else {
        console.warn(`⚠️ Invalid command at ${fullPath}`);
      }
    }
  }
}

console.log('\n📂 Loading commands...');
loadCommandsFromDir('./commands');

// Event handler
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(config.token);
