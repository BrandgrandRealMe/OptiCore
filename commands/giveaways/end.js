const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../../utils/DB/giveawayDB.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('End a giveaway early')
    .addStringOption(opt =>
      opt.setName('message_id')
        .setDescription('The giveaway message ID')
        .setRequired(true)),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    
    // Update end time to now
    db.prepare('UPDATE giveaways SET end_time = ? WHERE message_id = ?')
      .run(Date.now(), messageId);
      
    await interaction.reply({
      content: 'Giveaway will end shortly',
      flags: MessageFlags.EPHEMERAL // Fix: Use MessageFlags.EPHEMERAL
    });
  }
};