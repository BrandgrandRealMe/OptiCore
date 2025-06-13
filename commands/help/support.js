const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config/settings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Get help with using OptiCore'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('OptiCore Support ❓')
      .setDescription(
        'Need help with OptiCore? Here’s how to get assistance:\n\n' +
        '**1. Join the Discord**: Join our discord: https://discord.gg/MjcG8SzDpm\n' +
        '**2. Check Documentation**: Visit our [documentation](https://db.brandgrand.rocks/docs/OptiCore/) for guides.\n' +
        '**3. Contact the Owner**: For urgent issues, DM <@531186390717825074> (response times may vary).\n\n' +
        'We’re here to help you make the most of OptiCore!'
      )
      .setColor(config.bot.color)
      .setFooter({ text: config.bot.name, iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};