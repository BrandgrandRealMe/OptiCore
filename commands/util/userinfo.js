const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    time,
    TimestampStyles
  } = require('discord.js');
  const config = require('../../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('userinfo')
      .setDescription('Display information about a user')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('The user to get information about (defaults to you)')
          .setRequired(false)),
  
    async execute(interaction) {
      try {
        // Get the target user (defaults to command issuer)
        const targetUser = interaction.options.getUser('user') || interaction.user;
        // Get the guild member for server-specific info
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
  
        // Create embed
        const embed = new EmbedBuilder()
          .setTitle(`User Info: ${targetUser.tag}`)
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'Username', value: targetUser.username, inline: true },
            { name: 'User ID', value: targetUser.id, inline: true },
            { name: 'Is Bot', value: targetUser.bot ? 'Yes' : 'No', inline: true },
            { name: 'Account Created', value: time(targetUser.createdAt, TimestampStyles.LongDateTime), inline: true },
            { 
              name: 'Server Joined', 
              value: targetMember ? time(targetMember.joinedAt, TimestampStyles.LongDateTime) : 'Not in server', 
              inline: true 
            },
            { 
              name: 'Roles', 
              value: targetMember && targetMember.roles.cache.size > 1 
                ? targetMember.roles.cache
                    .filter(r => r.id !== interaction.guild.id) // Exclude @everyone
                    .map(r => r.toString())
                    .join(', ') || 'None'
                : 'Not in server', 
              inline: false 
            },
            { name: 'Avatar URL', value: `[Click here](${targetUser.displayAvatarURL({ dynamic: true, size: 1024 })})` }
          )
          .setColor(config.bot.color)
          .setFooter({ text: `Requested by ${interaction.user.tag}` })
          .setTimestamp();
  
        // Send reply
        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      } catch (err) {
        console.error(`Error executing userinfo for user ${interaction.user.id}:`, err);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription('❌ An error occurred while fetching user information. Please try again later.');
  
        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true
        });
      }
    }
  };