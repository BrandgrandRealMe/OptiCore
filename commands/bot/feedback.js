const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const config = require('../../config/settings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Submit feedback for OptiCore (bugs, features, or comments)'),

  async execute(interaction) {
    // Log command invocation
    console.log(`[${new Date().toISOString()}] /feedback invoked by ${interaction.user.id}`);

    // Define feedback types
    const feedbackTypes = [
      { label: 'Bug Report 🐛', value: 'bug', description: 'Report an issue with the bot' },
      { label: 'Feature Request 💡', value: 'feature', description: 'Suggest a new feature' },
      { label: 'General Feedback 💬', value: 'general', description: 'Share general thoughts' },
      { label: 'Compliment ❤️', value: 'compliment', description: 'Give praise to OptiCore' },
      { label: 'Complaint', value: 'complaint', description: 'Express concerns or issues' }
    ];

    // Create string select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`feedback_select_${interaction.id}`)
      .setPlaceholder('Choose feedback type...')
      .addOptions(feedbackTypes.map(type => ({
        label: type.label,
        value: type.value,
        description: type.description,
        emoji: type.label.match(/[\p{Emoji}]/u)?.[0]
      })));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send initial message
    await interaction.reply({
      content: 'Please select the type of feedback you’d like to submit:',
      components: [row],
      flags: MessageFlags.Ephemeral
    });

    // Handle select menu interaction
    const filter = i => i.customId === `feedback_select_${interaction.id}` && i.user.id === interaction.user.id;
    try {
      const selectInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 60_000 });
      const feedbackType = feedbackTypes.find(type => type.value === selectInteraction.values[0]);
      console.log(`[${new Date().toISOString()}] Feedback type selected: ${feedbackType.value}`);

      // Create modal
      const modal = new ModalBuilder()
        .setCustomId(`feedback_modal_${interaction.id}`)
        .setTitle(`${feedbackType.label} Submission`);

      // Modal inputs
      const detailsInput = new TextInputBuilder()
        .setCustomId('details')
        .setLabel('Feedback Details')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describe your feedback in detail...')
        .setRequired(true);

      const contextInput = new TextInputBuilder()
        .setCustomId('context')
        .setLabel('Additional Context (optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('E.g., command used, server name, or steps to reproduce (if applicable)')
        .setRequired(false);

      const rows = [detailsInput, contextInput].map(input =>
        new ActionRowBuilder().addComponents(input)
      );
      modal.addComponents(...rows);

      // Show modal
      await selectInteraction.showModal(modal);

      // Handle modal submission
      const modalFilter = i => i.customId === `feedback_modal_${interaction.id}` && i.user.id === interaction.user.id;
      const modalInteraction = await selectInteraction.awaitModalSubmit({ filter: modalFilter, time: 300_000 });
      console.log(`[${new Date().toISOString()}] Modal submitted by ${interaction.user.id}`);

      // Defer reply for modal interaction
      await modalInteraction.deferReply({ flags: MessageFlags.Ephemeral });

      // Get input values
      const details = modalInteraction.fields.getTextInputValue('details');
      const context = modalInteraction.fields.getTextInputValue('context') || 'None provided';

      // Fetch feedback channel
      let feedbackChannel;
      try {
        feedbackChannel = await interaction.client.channels.fetch(config.suggestion.channel);
        console.log(`[${new Date().toISOString()}] Fetched feedback channel: ${feedbackChannel.id}`);
      } catch (error) {
        console.warn(`[${new Date().toISOString()}] Failed to fetch SUGGESTIONS_CHANNEL: ${error.message}`);
        feedbackChannel = interaction.guild.channels.cache.find(c => c.name === 'suggestions' && c.isTextBased());
      }

      if (!feedbackChannel || !feedbackChannel.isTextBased()) {
        console.error(`[${new Date().toISOString()}] Invalid feedback channel`);
        return modalInteraction.editReply({
          content: '❌ Unable to send feedback: Feedback channel not found or invalid. Please contact the bot owner.'
        });
      }

      // Check bot permissions
      const botPermissions = feedbackChannel.permissionsFor(interaction.client.user);
      if (!botPermissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
        console.error(`[${new Date().toISOString()}] Bot lacks permissions in channel ${feedbackChannel.id}`);
        return modalInteraction.editReply({
          content: '❌ I lack permission to send messages or embeds in the feedback channel.'
        });
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`${feedbackType.label}`)
        .setDescription(`**Feedback from <@${interaction.user.id}>**\n${details}`)
        .addFields([
          { name: 'Type', value: feedbackType.label, inline: true },
          { name: 'Context', value: context, inline: false },
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'User ID', value: interaction.user.id, inline: true }
        ])
        .setColor(config.bot.color)
        .setFooter({ text: config.bot.name, iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      // Send feedback
      await feedbackChannel.send({ embeds: [embed] });
      console.log(`[${new Date().toISOString()}] Feedback (${feedbackType.value}) sent to channel ${feedbackChannel.id}`);

      // Confirm submission
      await modalInteraction.editReply({
        content: `✅ Your ${feedbackType.label.toLowerCase()} has been sent to the feedback channel. Thank you!`
      });

      // Clean up initial message
      await interaction.deleteReply().catch(error => {
        console.warn(`[${new Date().toISOString()}] Failed to delete initial message: ${error.message}`);
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error handling feedback:`, error);
      const replyContent = error.message.includes('time') 
        ? '❌ Feedback submission timed out. Please try again.'
        : '❌ An error occurred while processing your feedback. Please try again or contact the bot owner.';
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: replyContent, components: [] }).catch(() => {});
      } else {
        await interaction.followUp({ content: replyContent, flags: MessageFlags.Ephemeral }).catch(() => {});
      }
    }
  }
};