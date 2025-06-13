const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config/settings.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestion')
    .setDescription('Submit a suggestion for the bot')
    .addStringOption(option =>
      option.setName('suggest')
        .setDescription('Your suggestion for the bot')
        .setRequired(true)),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const suggestion = interaction.options.getString('suggest');
      const suggestionChannel = await interaction.client.channels.fetch(config.suggestion.channel);

      if (!suggestionChannel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription('❌ Suggestion channel not found. Please contact the bot owner.');
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Create suggestion embed
      const suggestionEmbed = new EmbedBuilder()
        .setTitle('New Suggestion')
        .setDescription(`**Suggestion:** ${suggestion}\n**Submitted by:** ${interaction.user.tag} (${interaction.user.id})`)
        .setColor(config.bot.color)
        .setFooter({ text: 'Status: Pending' })
        .setTimestamp();

      // Create buttons
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('suggestion_accept')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('suggestion_reject')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('suggestion_review')
            .setLabel('Review')
            .setStyle(ButtonStyle.Secondary)
        );

      // Send suggestion to channel
      const message = await suggestionChannel.send({
        embeds: [suggestionEmbed],
        components: [row]
      });

      // Confirm submission
      const confirmationEmbed = new EmbedBuilder()
        .setColor(config.bot.color)
        .setTitle('Suggestion Submitted')
        .setDescription(`Your suggestion has been sent to the bot owner for review!\n**Suggestion:** ${suggestion}`)
        .setTimestamp();

      await interaction.editReply({
        embeds: [confirmationEmbed]
      });
    } catch (err) {
      console.error(`Error executing suggestion for user ${interaction.user.id}:`, err);
      const errorEmbed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setDescription('❌ An error occurred while submitting your suggestion. Please try again later.');
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};