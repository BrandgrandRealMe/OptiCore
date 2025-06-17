const { EmbedBuilder } = require('discord.js');
const db = require('../utils/DB/goodbyeDB.js');
const config = require('../config/settings.js');
const { format } = require('date-fns');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    try {
      const settings = db.prepare('SELECT * FROM goodbye_settings WHERE guild_id = ? AND enabled = 1').get(member.guild.id);
      if (!settings) {
        console.log(`No active goodbye settings for guild ${member.guild.id}`);
        return;
      }

      const channel = await member.guild.channels.fetch(settings.channel_id).catch(() => null);
      if (!channel || !channel.isTextBased()) {
        console.log(`Invalid or non-text channel ${settings.channel_id} for guild ${member.guild.id}`);
        return;
      }

      // Check bot permissions
      const botPermissions = channel.permissionsFor(member.client.user);
      const requiredPermissions = settings.message_type === 'embed'
        ? ['EmbedLinks', 'SendMessages']
        : ['SendMessages'];
      if (!botPermissions.has(requiredPermissions)) {
        console.log(`Missing permissions in channel ${settings.channel_id} for guild ${member.guild.id}`);
        return;
      }

      // Format current date and time
      const currentDate = format(new Date(), "hh:mm a zzz 'on' EEEE, MMMM dd, yyyy");

      const content = settings.content
        ? settings.content
            .replace('{user}', member.user.username)
            .replace('{server}', member.guild.name)
            .replace('{date}', currentDate)
        : `Goodbye ${member.user.username} from ${member.guild.name}! ${currentDate}`;

      if (settings.message_type === 'embed') {
        const embed = new EmbedBuilder()
          .setTitle(`Goodbye from ${member.guild.name}!`)
          .setDescription(content)
          .setColor(config.bot.color)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: config.bot.name, iconURL: member.client.user.displayAvatarURL() })
          .setTimestamp();
        await channel.send({ embeds: [embed] });
      } else {
        await channel.send(content);
      }

      console.log(`Sent goodbye message for ${member.user.id} in guild ${member.guild.id}`);
    } catch (err) {
      console.error(`Error sending goodbye message for user ${member.user.id} in guild ${member.guild.id}:`, err);
    }
  }
};