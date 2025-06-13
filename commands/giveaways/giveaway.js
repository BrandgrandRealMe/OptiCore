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
const db = require('../../utils/DB/giveawayDB.js');
const config = require('../../config/settings.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a new giveaway')
    .addStringOption(opt =>
      opt.setName('prize')
        .setDescription('What are you giving away?')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('winners')
        .setDescription('Number of winners (default: 1)')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('requirements')
        .setDescription('Requirements to enter (e.g. "Must follow X")')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getInteger('duration') * 60 * 1000; // Convert to ms
    const winners = interaction.options.getInteger('winners') || 1;
    const requirements = interaction.options.getString('requirements');
    const endTime = Date.now() + duration;

    // Validate inputs
    if (duration < 60000 || duration > 2592000000) {
      return interaction.reply({
        content: 'Duration must be between 1 minute and 30 days',
        ephemeral: true
      });
    }

    if (winners < 1 || winners > 10) {
      return interaction.reply({
        content: 'Number of winners must be between 1 and 10',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎉 ${prize}`)
      .setDescription(
        `**Hosted by:** ${interaction.user}\n` +
        `**Ends:** ${time(Math.floor(endTime / 1000), TimestampStyles.RelativeTime)}\n` +
        `**Winners:** ${winners}\n` +
        (requirements ? `**Requirements:** ${requirements}\n\n` : '\n') +
        'Click the button below to enter!'
      )
      .setColor(config.bot.color)
      .setFooter({ text: `ID: ${interaction.id}` })
      .setTimestamp(endTime);

    const enterButton = new ButtonBuilder()
      .setCustomId(`enter_${interaction.id}_${interaction.channel.id}`) // Use message.id after sending
      .setLabel('🎉 Enter Giveaway')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(enterButton);

    const message = await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      fetchReply: true 
    });

    // Update button customId with message.id
    enterButton.setCustomId(`enter_${message.id}`);
    await message.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(enterButton)] });

    // Store in database
    db.prepare(`
      INSERT INTO giveaways 
      (message_id, channel_id, prize, end_time, winners, requirements, host_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      message.id, 
      interaction.channel.id, 
      prize, 
      endTime, 
      winners, 
      requirements,
      interaction.user.id
    );

    await interaction.followUp({
      content: `Giveaway started! [Jump to giveaway](${message.url})`,
      ephemeral: true
    });
  }
};