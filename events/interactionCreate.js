const db = require('../utils/DB/giveawayDB.js');
const pollDb = require('../utils/DB/pollDB.js');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config/settings.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle buttons
    if (interaction.isButton()) {
      // Handle giveaway entry button
      if (interaction.customId.startsWith('enter_')) {
        const messageId = interaction.customId.replace('enter_', '');
        const userId = interaction.user.id;

        try {
          const giveaway = db.prepare(`
            SELECT * FROM giveaways 
            WHERE message_id = ? 
            AND end_time > ?
            AND ended = 0
          `).get(messageId, Date.now());

          if (!giveaway) {
            console.log(`No active giveaway found for message ID: ${messageId}`);
            return interaction.reply({
              content: '❌ This giveaway has ended or does not exist!',
              ephemeral: true
            });
          }

          const existingEntry = db.prepare(`
            SELECT 1 FROM entries 
            WHERE message_id = ? AND user_id = ?
          `).get(messageId, userId);

          if (existingEntry) {
            console.log(`User ${userId} already entered giveaway ${messageId}`);
            return interaction.reply({
              content: '❌ You have already entered this giveaway!',
              ephemeral: true
            });
          }

          db.prepare(`
            INSERT INTO entries (message_id, user_id, entry_time) 
            VALUES (?, ?, ?)
          `).run(messageId, userId, Date.now());

          const entryCount = db.prepare(`
            SELECT COUNT(*) as count FROM entries 
            WHERE message_id = ?
          `).get(messageId).count;

          const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setDescription(`✅ You've entered the giveaway for **${giveaway.prize}**!\n\n📊 Total entries: ${entryCount}`);

          await interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        } catch (err) {
          console.error(`Giveaway entry error for message ID ${messageId}, user ${userId}:`, err);
          const errorEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setDescription('❌ An error occurred while entering the giveaway. Please try again later.');

          await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
          });
        }
        return;
      }

      // Handle poll vote button
      if (interaction.customId.startsWith('poll_vote_')) {
        const parts = interaction.customId.split('_');
        const optionIndex = parseInt(parts[2]);
        const messageId = parts[3];
        const userId = interaction.user.id;

        try {
          const poll = pollDb.prepare(`
            SELECT * FROM polls 
            WHERE message_id = ? 
            AND end_time > ?
            AND ended = 0
          `).get(messageId, Date.now());

          if (!poll) {
            console.log(`No active poll found for message ID: ${messageId}`);
            return interaction.reply({
              content: '❌ This poll has ended or does not exist!',
              ephemeral: true
            });
          }

          const existingVote = pollDb.prepare(`
            SELECT 1 FROM poll_votes 
            WHERE message_id = ? AND user_id = ?
          `).get(messageId, userId);

          if (existingVote) {
            console.log(`User ${userId} already voted in poll ${messageId}`);
            return interaction.reply({
              content: '❌ You have already voted in this poll!',
              ephemeral: true
            });
          }

          pollDb.prepare(`
            INSERT INTO poll_votes (message_id, user_id, option_index, vote_time) 
            VALUES (?, ?, ?, ?)
          `).run(messageId, userId, optionIndex, Date.now());

          const options = JSON.parse(poll.options);
          const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setDescription(`✅ You voted for option ${optionIndex + 1}: **${options[optionIndex]}**!`);

          await interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        } catch (err) {
          console.error(`Poll vote error for message ID ${messageId}, user ${userId}:`, err);
          const errorEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setDescription('❌ An error occurred while voting. Please try again later.');

          await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
          });
        }
        return;
      }

      // Handle suggestion buttons
      if (['suggestion_accept', 'suggestion_reject', 'suggestion_review'].includes(interaction.customId)) {
        if (interaction.user.id !== config.bot.ownerId) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setDescription('❌ Only the bot owner can manage suggestions.');
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        let status, color;
        switch (interaction.customId) {
          case 'suggestion_accept':
            status = 'Accepted';
            color = '#2ecc71'; // Green
            break;
          case 'suggestion_reject':
            status = 'Rejected';
            color = '#e74c3c'; // Red
            break;
          case 'suggestion_review':
            status = 'Under Review';
            color = '#f1c40f'; // Yellow
            break;
        }

        // Update embed
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(color)
          .setFooter({ text: `Status: ${status}` })
          .setTimestamp();

        // Create new disabled buttons
        const disabledButtons = interaction.message.components[0].components.map(component => 
          new ButtonBuilder()
            .setCustomId(component.customId)
            .setLabel(component.label)
            .setStyle(component.style)
            .setDisabled(true)
        );

        const row = new ActionRowBuilder().addComponents(disabledButtons);

        await interaction.update({
          embeds: [updatedEmbed],
          components: [row]
        });

        // Notify user
        const userId = interaction.message.embeds[0].description.match(/\(\d+\)$/)[0].slice(1, -1);
        try {
          const user = await client.users.fetch(userId);
          const notifyEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('Suggestion Update')
            .setDescription(`Your suggestion has been **${status.toLowerCase()}** by the bot owner.\n**Suggestion:** ${interaction.message.embeds[0].description.split('\n')[0].replace('**Suggestion:** ', '')}`)
            .setTimestamp();
          await user.send({ embeds: [notifyEmbed] });
        } catch (err) {
          console.error(`Failed to notify user ${userId}:`, err);
        }
        return;
      }
    }

    // Handle chat input commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.log(`Command ${interaction.commandName} not found`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setTitle('❌ Command Error')
          .setDescription('An error occurred while executing this command.');

        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ 
            embeds: [errorEmbed],
            ephemeral: true
          });
        }
      }
      return;
    }
  }
};