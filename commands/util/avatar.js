const { 
    SlashCommandBuilder, 
    EmbedBuilder
  } = require('discord.js');
  const config = require('../../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('Display a user\'s avatar')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('The user whose avatar you want to see (defaults to you)')
          .setRequired(false)),
  
    async execute(interaction) {
      try {
        // Get the target user (defaults to command issuer)
        const targetUser = interaction.options.getUser('user') || interaction.user;
  
        // Create embed
        const embed = new EmbedBuilder()
          .setTitle(`${targetUser.username}'s Avatar`)
          .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
          .addFields(
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
        console.error(`Error executing avatar command for user ${interaction.user.id}:`, err);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription('❌ An error occurred while fetching the avatar. Please try again later.');
  
        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true
        });
      }
    }
  };