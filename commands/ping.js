const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/settings.js');
const { version } = require('discord.js');
const os = require('node:os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency and status'),

  async execute(interaction) {
    // Calculate latencies
    const botLatency = Date.now() - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    // Calculate uptime
    const uptimeSeconds = Math.floor(process.uptime());
    const uptime = {
      days: Math.floor(uptimeSeconds / 86400),
      hours: Math.floor((uptimeSeconds % 86400) / 3600),
      minutes: Math.floor((uptimeSeconds % 3600) / 60),
      seconds: Math.floor(uptimeSeconds % 60)
    };
    
    // Get system info
    const cpuUsage = `${(process.cpuUsage().user / 1000000).toFixed(2)}%`;
    const memoryUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
    const platform = `${os.platform()} (${os.arch()})`;
    
    const embed = new EmbedBuilder()
      .setTitle(`${config.bot.name} | System Status`)
      .setColor(config.bot.color)
      .addFields(
        { name: '🏓 Pong!', value: 'Here are my current stats:', inline: false },
        { name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'Uptime', value: `${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s`, inline: true },
        { name: 'Discord.js Version', value: `v${version}`, inline: true },
        { name: 'Node.js Version', value: process.version, inline: true },
        { name: 'CPU Usage', value: cpuUsage, inline: true },
        { name: 'Memory Usage', value: memoryUsage, inline: true },
        { name: 'Platform', value: platform, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};