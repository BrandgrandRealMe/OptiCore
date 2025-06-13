const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config/settings.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of messages from a channel.')
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Number of messages to delete').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: 'Please enter a number between 1 and 100.', ephemeral: true });
    }

    await interaction.channel.bulkDelete(amount, true);

    const embed = new EmbedBuilder()
      .setTitle(`${config.bot.name} | Clear`)
      .setDescription(`🧹 Deleted ${amount} messages.`)
      .setColor(config.bot.color);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
