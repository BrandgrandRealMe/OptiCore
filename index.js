const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config/settings');

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

// Deploy commands to Discord API
async function deployCommands() {
  const commands = [];

  // Load commands for deployment
  console.log('\n📋 Preparing commands for deployment...');
  loadCommandsFromDir('./commands');

  // Collect command data for REST API
  for (const [name, command] of client.commands) {
    commands.push(command.data.toJSON());
    console.log(`✅ Registered for deployment: /${name}`);
  }

  // Initialize REST client
  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log(`🔁 Deploying ${commands.length} application (/) commands to ${config.scope} scope...`);

    // Choose deployment route based on scope
    const route =
      config.scope === 'guild'
        ? Routes.applicationGuildCommands(config.clientId, config.guildId)
        : Routes.applicationCommands(config.clientId);

    // Deploy commands
    await rest.put(route, { body: commands });
    console.log(`✅ Successfully deployed ${commands.length} command(s) to ${config.scope} scope.`);
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error.message);
    console.error('Error details:', error);
  }
}

// Main bot initialization
async function startBot() {
  try {
    // Deploy commands before starting
    await deployCommands();

    // Load commands for runtime
    console.log('\n📂 Loading commands for runtime...');
    loadCommandsFromDir('./commands');

    // Event handler
    console.log('\n📅 Loading events...');
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`./events/${file}`);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      console.log(`✅ Loaded event: ${event.name}`);
    }

    // Log in to Discord
    console.log('\n🚀 Logging in to Discord...');
    await client.login(config.token);
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot
startBot();