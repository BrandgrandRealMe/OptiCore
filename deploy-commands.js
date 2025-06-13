const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config/settings');

const commands = [];

async function loadCommands(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await loadCommands(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const command = require(path.resolve(fullPath));
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Registered: /${command.data.name}`);
      } else {
        console.warn(`⚠️ Invalid command file: ${fullPath}`);
      }
    }
  }
}

console.log('\n📦 Deploying slash commands...');
loadCommands('./commands');

const rest = new REST({ version: '10' }).setToken(config.token);
await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: [] });

(async () => {
  try {
    console.log(`🔁 Refreshing ${config.scope} application (/) commands...`);

    const route =
      config.scope === 'guild'
        ? Routes.applicationGuildCommands(config.clientId, config.guildId)
        : Routes.applicationCommands(config.clientId);

    await rest.put(route, { body: commands });

    console.log(`✅ Successfully deployed ${commands.length} command(s) to ${config.scope} scope.`);
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
  }
})();