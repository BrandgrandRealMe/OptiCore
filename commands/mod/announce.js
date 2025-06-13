const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config/settings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Create an announcement in a specified channel via a modal')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    // Log command invocation
    console.log(`[${new Date().toISOString()}] /announce invoked by ${interaction.user.id}`);

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId(`announce_modal_${interaction.id}`) // Unique custom ID per interaction
      .setTitle('Create Announcement');

    // Create text input fields
    const channelInput = new TextInputBuilder()
      .setCustomId('channel_id')
      .setLabel('Channel ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter the channel ID (e.g., 1382938942999105546)')
      .setRequired(true);

    const pingInput = new TextInputBuilder()
      .setCustomId('ping')
      .setLabel('Ping (Role/User)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter role/user ID or @everyone (optional)')
      .setRequired(false);

    const titleInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Announcement Title')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter the announcement title')
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Announcement Description')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter the announcement content')
      .setRequired(true);

    const footerInput = new TextInputBuilder()
      .setCustomId('footer')
      .setLabel('Footer Text')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter footer text (optional)')
      .setRequired(false);

    // Add inputs to modal
    const rows = [channelInput, pingInput, titleInput, descriptionInput, footerInput].map(input =>
      new ActionRowBuilder().addComponents(input)
    );
    modal.addComponents(...rows);

    // Show the modal
    await interaction.showModal(modal);

    // Handle modal submission
    const filter = i => i.customId === `announce_modal_${interaction.id}` && i.user.id === interaction.user.id;
    try {
      // Defer reply immediately to prevent Discord retries
      const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 300_000 });
      await modalInteraction.deferReply({ ephemeral: true });
      console.log(`[${new Date().toISOString()}] Modal submitted by ${interaction.user.id}`);

      // Get input values
      const channelId = modalInteraction.fields.getTextInputValue('channel_id');
      const ping = modalInteraction.fields.getTextInputValue('ping') || '';
      const title = modalInteraction.fields.getTextInputValue('title');
      const description = modalInteraction.fields.getTextInputValue('description');
      const footer = modalInteraction.fields.getTextInputValue('footer') || '';

      // Fetch the channel
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel || !channel.isTextBased()) {
        return modalInteraction.editReply({
          content: '❌ Invalid channel ID or the channel is not text-based.'
        });
      }

      // Check user permissions in the channel
      const userPermissions = channel.permissionsFor(interaction.member);
      if (!userPermissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages])) {
        return modalInteraction.editReply({
          content: '❌ You lack permission to send or manage messages in the specified channel.'
        });
      }

      // Check bot permissions in the channel
      const botPermissions = channel.permissionsFor(interaction.client.user);
      if (!botPermissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
        return modalInteraction.editReply({
          content: '❌ I lack permission to send messages or embed links in the specified channel.'
        });
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(config.bot.color)
        .setTimestamp()
        .setFooter({
          text: footer || `Announced by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      // Prepare ping content
      let pingContent = '';
      if (ping) {
        if (ping === '@everyone' || ping === '@here') {
          pingContent = ping;
        } else {
          const roleOrUser = await interaction.guild.roles.fetch(ping).catch(() =>
            interaction.guild.members.fetch(ping).catch(() => null)
          );
          if (roleOrUser) {
            pingContent = `<@${roleOrUser.id}>`;
          }
        }
      }

      // Send the announcement
      await channel.send({
        content: pingContent,
        embeds: [embed]
      });
      console.log(`[${new Date().toISOString()}] Announcement sent to channel ${channelId}`);

      // Confirm success
      await modalInteraction.editReply({
        content: `✅ Announcement sent to <#${channelId}> successfully!`
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error handling announce modal:`, error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ An error occurred or the modal timed out (5 minutes). Please try again.',
          ephemeral: true
        }).catch(() => {});
      } else if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while processing the announcement. Please try again.'
        }).catch(() => {});
      }
    }
  }
};