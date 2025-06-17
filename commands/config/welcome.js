const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionsBitField, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
  } = require('discord.js');
  const config = require('../../config/settings.js');
  const db = require('../../utils/DB/welcomeDB.js');
  const { format } = require('date-fns');
  
  // Use native fetch if available (Node.js 18+), otherwise fall back to node-fetch
  let fetch;
  try {
    fetch = globalThis.fetch || require('node-fetch').default;
  } catch {
    console.warn('Falling back to node-fetch. Ensure it is installed.');
    fetch = async (...args) => {
      const { default: nodeFetch } = await import('node-fetch');
      return nodeFetch(...args);
    };
  }
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('welcome')
      .setDescription('Manage the welcome system for your server')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
      .addSubcommand(sub =>
        sub.setName('setup')
          .setDescription('Set up or update the welcome system')
          .addStringOption(opt =>
            opt.setName('type')
              .setDescription('Type of welcome message')
              .setRequired(true)
              .addChoices(
                { name: 'Embed', value: 'embed' },
                { name: 'Normal Message', value: 'normal' }
              )))
      .addSubcommand(sub =>
        sub.setName('test')
          .setDescription('Test the welcome message for this server'))
      .addSubcommand(sub =>
        sub.setName('disable')
          .setDescription('Disable the welcome system')),
  
    async execute(interaction) {
      try {
        const subcommand = interaction.options.getSubcommand();
  
        if (subcommand === 'setup') {
          const messageType = interaction.options.getString('type');
  
          // Create modal
          const modal = new ModalBuilder()
            .setCustomId(`welcome_setup_${interaction.id}`)
            .setTitle('Welcome System Setup');
  
          // Modal inputs
          const channelInput = new TextInputBuilder()
            .setCustomId('channel_id')
            .setLabel('Channel ID')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter the channel ID (e.g., 1382938942999105546)')
            .setRequired(true);
  
          const contentInput = new TextInputBuilder()
            .setCustomId('content')
            .setLabel('Message Content')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the welcome message (e.g., {user} joined {server} on {date})')
            .setRequired(false);
  
          const rows = [channelInput, contentInput].map(input =>
            new ActionRowBuilder().addComponents(input)
          );
          modal.addComponents(...rows);
  
          // Show modal without deferring
          await interaction.showModal(modal);
  
          // Handle modal submission
          const filter = i => i.customId === `welcome_setup_${interaction.id}` && i.user.id === interaction.user.id;
          const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 300_000 });
          await modalInteraction.deferReply({ ephemeral: true });
  
          // Get input values
          const channelId = modalInteraction.fields.getTextInputValue('channel_id');
          const content = modalInteraction.fields.getTextInputValue('content') || null;
  
          // Validate channel
          const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
          if (!channel || !channel.isTextBased()) {
            return modalInteraction.editReply({
              content: '❌ Invalid channel ID or the channel is not text-based.'
            });
          }
  
          // Check bot permissions
          const botPermissions = channel.permissionsFor(interaction.client.user);
          const requiredPermissions = messageType === 'embed'
            ? [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks]
            : [PermissionsBitField.Flags.SendMessages];
          if (!botPermissions.has(requiredPermissions)) {
            return modalInteraction.editReply({
              content: `❌ I lack permission to send ${messageType === 'embed' ? 'embeds' : 'messages'} in the specified channel.`
            });
          }
  
          // Save settings
          db.prepare(`
            INSERT OR REPLACE INTO welcome_settings (guild_id, channel_id, message_type, content, enabled)
            VALUES (?, ?, ?, ?, ?)
          `).run(interaction.guild.id, channelId, messageType, content, 1);
  
          const embed = new EmbedBuilder()
            .setColor(config.bot.color)
            .setTitle('Welcome System Configured')
            .setDescription(
              `**Channel:** <#${channelId}>\n` +
              `**Type:** ${messageType.charAt(0).toUpperCase() + messageType.slice(1)}\n` +
              `**Content:** ${content || 'Default'}\n` +
              `**Note:** {date} will include the current date and time (e.g., 08:24 PM CDT on Sunday, June 15, 2025)`
            )
            .setFooter({ text: config.bot.name, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
  
          await modalInteraction.editReply({ embeds: [embed] });
        } else {
          // Defer reply for test and disable subcommands
          await interaction.deferReply({ ephemeral: true });
  
          if (subcommand === 'test') {
            // Fetch welcome settings
            const settings = db.prepare('SELECT * FROM welcome_settings WHERE guild_id = ? AND enabled = 1').get(interaction.guild.id);
            if (!settings) {
              return interaction.editReply({
                content: '❌ No active welcome system is set up for this server. Use `/welcome setup` to configure it.'
              });
            }
  
            // Validate channel
            const channel = await interaction.guild.channels.fetch(settings.channel_id).catch(() => null);
            if (!channel || !channel.isTextBased()) {
              return interaction.editReply({
                content: '❌ The configured welcome channel is invalid or not text-based.'
              });
            }
  
            // Check bot permissions
            const botPermissions = channel.permissionsFor(interaction.client.user);
            const requiredPermissions = settings.message_type === 'embed'
              ? ['EmbedLinks', 'SendMessages']
              : ['SendMessages'];
            if (!botPermissions.has(requiredPermissions)) {
              return interaction.editReply({
                content: `❌ I lack permission to send ${settings.message_type === 'embed' ? 'embeds' : 'messages'} in the welcome channel.`
              });
            }
  
            // Format current date and time
            const currentDate = format(new Date(), "hh:mm a zzz 'on' EEEE, MMMM dd, yyyy");
  
            // Simulate welcome message
            const content = settings.content
              ? settings.content
                  .replace('{user}', `<@${interaction.user.id}>`)
                  .replace('{server}', interaction.guild.name)
                  .replace('{date}', currentDate)
              : `Welcome <@${interaction.user.id}> to ${interaction.guild.name}! ${currentDate}`;
  
            if (settings.message_type === 'embed') {
              const embed = new EmbedBuilder()
                .setTitle(`Welcome to ${interaction.guild.name}!`)
                .setDescription(content)
                .setColor(config.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: config.bot.name, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
              await channel.send({ embeds: [embed] });
            } else {
              await channel.send(content);
            }
  
            const successEmbed = new EmbedBuilder()
              .setColor(config.bot.color)
              .setTitle('Welcome Test Successful')
              .setDescription(`A test welcome message was sent to <#${settings.channel_id}>.`)
              .setFooter({ text: config.bot.name, iconURL: interaction.client.user.displayAvatarURL() })
              .setTimestamp();
            await interaction.editReply({ embeds: [successEmbed] });
          }
  
          if (subcommand === 'disable') {
            const settings = db.prepare('SELECT * FROM welcome_settings WHERE guild_id = ?').get(interaction.guild.id);
            if (!settings) {
              return interaction.editReply({
                content: '❌ No welcome system is set up for this server.'
              });
            }
  
            db.prepare('UPDATE welcome_settings SET enabled = 0 WHERE guild_id = ?').run(interaction.guild.id);
  
            const embed = new EmbedBuilder()
              .setColor(config.bot.color)
              .setTitle('Welcome System Disabled')
              .setDescription('The welcome system has been disabled for this server.')
              .setFooter({ text: config.bot.name, iconURL: interaction.client.user.displayAvatarURL() })
              .setTimestamp();
  
            await interaction.editReply({ embeds: [embed] });
          }
        }
      } catch (err) {
        console.error(`Error executing welcome command for user ${interaction.user.id}:`, err);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription('❌ An error occurred while processing the welcome command. Please try again later.');
  
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      }
    }
  };