const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    time,
    TimestampStyles
  } = require('discord.js');
  const config = require('../../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('serverinfo')
      .setDescription('Display information about the server'),
  
    async execute(interaction) {
      try {
        const guild = interaction.guild;
        console.log(`Processing serverinfo for guild ${guild.id}`);
  
        const totalMembers = guild.memberCount;
        const humanMembers = guild.members.cache.filter(m => !m.user.bot).size;
        const botMembers = guild.members.cache.filter(m => m.user.bot).size;
  
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
  
        const roleCount = guild.roles.cache.size - 1;
  
        console.log(`Fetching owner for guild ${guild.id}`);
        const owner = await guild.fetchOwner();
  
        const embed = new EmbedBuilder()
          .setTitle(`Server Info: ${guild.name}`)
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .addFields(
            { name: 'Server Name', value: guild.name, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Created', value: time(guild.createdAt, TimestampStyles.LongDateTime), inline: true },
            { name: 'Owner', value: `${owner.user.tag}`, inline: true },
            { name: 'Members', value: `Total: ${totalMembers}\nHumans: ${humanMembers}\nBots: ${botMembers}`, inline: true },
            { name: 'Channels', value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}`, inline: true },
            { name: 'Roles', value: `${roleCount}`, inline: true },
            { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
            { name: 'Icon URL', value: guild.iconURL() ? `[Click here](${guild.iconURL({ dynamic: true, size: 1024 })})` : 'None' }
          )
          .setColor(config.bot.color)
          .setFooter({ text: `Requested by ${interaction.user.tag}` })
          .setTimestamp();
  
        console.log(`Sending serverinfo reply for guild ${guild.id}`);
        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      } catch (err) {
        console.error(`Error executing serverinfo for guild ${interaction.guild?.id || 'unknown'}:`, err);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription('❌ An error occurred while fetching server information. Please try again later.');
  
        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true
        });
      }
    }
  };