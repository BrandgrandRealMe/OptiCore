const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reroll')
    .setDescription('Reroll a giveaway winner')
    .addStringOption(opt =>
      opt.setName('message_id')
        .setDescription('Message ID of the original giveaway')
        .setRequired(true)
    ),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');

    try {
      const channel = interaction.channel;
      const message = await channel.messages.fetch(messageId);
      const reaction = message.reactions.cache.get('🎉');

      if (!reaction) {
        return interaction.reply({ content: '❌ No 🎉 reaction found on that message.', ephemeral: true });
      }

      const users = await reaction.users.fetch();
      const entries = users.filter(u => !u.bot).map(u => u.id);

      if (entries.length === 0) {
        return interaction.reply({ content: '❌ No valid entries to reroll.', ephemeral: true });
      }

      const winnerId = entries[Math.floor(Math.random() * entries.length)];
      await interaction.reply({
        content: `🎊 New winner: <@${winnerId}>! Congratulations!`,
        allowedMentions: { users: [winnerId] }
      });
    } catch (err) {
      console.error('❌ Reroll failed:', err);
      await interaction.reply({ content: '❌ Could not reroll this giveaway.', ephemeral: true });
    }
  }
};
