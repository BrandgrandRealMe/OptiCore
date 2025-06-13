const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/DB/giveawayDB.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-list')
    .setDescription('List all active giveaways'),

  async execute(interaction) {
    const giveaways = db.prepare(`
      SELECT * FROM giveaways 
      WHERE ended = 0 
      AND channel_id IN (
        SELECT channel_id FROM guild_channels 
        WHERE guild_id = ?
      )
      ORDER BY end_time ASC
    `).all(interaction.guild.id);

    if (giveaways.length === 0) {
      return interaction.reply({
        content: 'There are no active giveaways',
        flags: MessageFlags.FLAGS.EPHEMERAL
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 Active Giveaways')
      .setDescription(giveaways.map(g => 
        `[${g.prize}](https://discord.com/channels/${interaction.guild.id}/${g.channel_id}/${g.message_id})\n` +
        `Ends: <t:${Math.floor(g.end_time / 1000)}:R> | Winners: ${g.winners}`
      ).join('\n\n'))
      .setColor(0x3498db);

    await interaction.reply({ embeds: [embed] });
  }
};