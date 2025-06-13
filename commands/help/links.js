const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config/settings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('links')
    .setDescription('View useful links for OptiCore'),

  async execute(interaction) {
    // Define links array for easy modification
    const links = [
      { name: 'Documentation', value: '[View Docs](https://db.brandgrand.rocks/docs/OptiCore/)' },
      { name: 'Privacy Policy', value: '[Read Policy](https://db.brandgrand.rocks/docs/OptiCore/PrivacyPolicy)' },
      { name: 'Terms of Service', value: '[Read Terms](https://db.brandgrand.rocks/docs/OptiCore/TermsOfService)' },
      { name: 'Top.gg', value: '[Vote on Top.gg](https://top.gg/bot/1381801285329883176)' }
      // Add more links here, e.g., { name: 'Support Server', value: '[Join Server](https://discord.gg/example)' }
    ];

    const embed = new EmbedBuilder()
      .setTitle('OptiCore Links 🔗')
      .setDescription('Explore these resources to learn more about OptiCore:')
      .addFields(links.map(link => ({ name: link.name, value: link.value, inline: false })))
      .setColor(config.bot.color)
      .setFooter({ text: config.bot.name, iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};