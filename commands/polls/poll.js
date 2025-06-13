const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    PermissionFlagsBits,
    time,
    TimestampStyles
  } = require('discord.js');
  const db = require('../../utils/DB/pollDB.js');
  const config = require('../../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('poll')
      .setDescription('Create a new poll')
      .addStringOption(opt =>
        opt.setName('question')
          .setDescription('The poll question')
          .setRequired(true))
      .addStringOption(opt =>
        opt.setName('options')
          .setDescription('Comma-separated options (e.g., Red,Blue,Green)')
          .setRequired(true))
      .addIntegerOption(opt =>
        opt.setName('duration')
          .setDescription('Duration in minutes (default: 60)')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
    async execute(interaction) {
      const question = interaction.options.getString('question');
      const optionsInput = interaction.options.getString('options');
      const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);
      const duration = (interaction.options.getInteger('duration') || 60) * 60 * 1000; // Default 60 minutes
      const endTime = Date.now() + duration;
  
      // Validate inputs
      if (options.length < 2) {
        return interaction.reply({
          content: 'At least two options are required!',
          ephemeral: true
        });
      }
      if (options.length > 5) {
        return interaction.reply({
          content: 'Maximum 5 options allowed!',
          ephemeral: true
        });
      }
      if (duration < 60000 || duration > 2592000000) { // 1 minute to 30 days
        return interaction.reply({
          content: 'Duration must be between 1 minute and 30 days',
          ephemeral: true
        });
      }
  
      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`📊 ${question}`)
        .setDescription(
          options.map((opt, i) => `${i + 1}. ${opt}`).join('\n') +
          `\n\n**Ends:** ${time(Math.floor(endTime / 1000), TimestampStyles.RelativeTime)}`
        )
        .setColor(config.bot.color)
        .setFooter({ text: `Poll ID: ${interaction.id}` })
        .setTimestamp(endTime);
  
      // Create buttons
      const buttons = options.map((opt, i) =>
        new ButtonBuilder()
          .setCustomId(`poll_vote_${i}_${interaction.id}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary)
      );
      const row = new ActionRowBuilder().addComponents(buttons);
  
      // Send message
      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true
      });
  
      // Update button customId with message.id
      const updatedButtons = options.map((opt, i) =>
        new ButtonBuilder()
          .setCustomId(`poll_vote_${i}_${message.id}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary)
      );
      await message.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(updatedButtons)] });
  
      // Store in database
      db.prepare(`
        INSERT INTO polls 
        (message_id, channel_id, question, options, end_time, host_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        message.id,
        interaction.channel.id,
        question,
        JSON.stringify(options),
        endTime,
        interaction.user.id
      );
  
      await interaction.followUp({
        content: `Poll created! [Jump to poll](${message.url})`,
        ephemeral: true
      });
    }
  };