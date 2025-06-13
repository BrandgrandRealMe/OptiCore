const db = require('./DB/giveawayDB.js');
const { EmbedBuilder } = require('discord.js');

async function startGiveawayManager(client) {
  setInterval(async () => {
    const now = Date.now();
    const giveaways = db.prepare('SELECT * FROM giveaways WHERE end_time <= ? AND ended = 0').all(now);

    for (const giveaway of giveaways) {
      try {
        const channel = await client.channels.fetch(giveaway.channel_id);
        if (!channel) {
          console.log(`Channel ${giveaway.channel_id} not found for giveaway ${giveaway.message_id}`);
          db.prepare('UPDATE giveaways SET ended = 1 WHERE message_id = ?').run(giveaway.message_id);
          continue;
        }

        const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
        if (!message) {
          console.log(`Message ${giveaway.message_id} not found in channel ${giveaway.channel_id}`);
          db.prepare('UPDATE giveaways SET ended = 1 WHERE message_id = ?').run(giveaway.message_id);
          continue;
        }

        const entries = db.prepare('SELECT user_id FROM entries WHERE message_id = ?').all(giveaway.message_id);
        
        // Mark as ended
        db.prepare('UPDATE giveaways SET ended = 1 WHERE message_id = ?').run(giveaway.message_id);

        // Create updated embed
        const embed = new EmbedBuilder(message.embeds[0].data)
          .setTitle(`🎉 ${giveaway.prize} - ENDED`)
          .setColor(0xFF0000);

        if (entries.length === 0) {
          embed.setDescription('No one entered this giveaway 😢');
          await message.edit({ embeds: [embed], components: [] });
          await channel.send(`The giveaway for **${giveaway.prize}** ended with no participants.`);
          continue;
        }

        // Select winners
        const shuffled = entries.sort(() => 0.5 - Math.random());
        const winners = shuffled.slice(0, Math.min(giveaway.winners, entries.length));
        const winnersMention = winners.map(w => `<@${w.user_id}>`).join(', ');

        // Update embed description to include winners
        embed.setDescription(
          `**Winners:** ${winnersMention}\n` +
          `**Prize:** ${giveaway.prize}\n` +
          `**Hosted by:** <@${giveaway.host_id}>\n` +
          `**Ended:** <t:${Math.floor(giveaway.end_time / 1000)}:R>\n` +
          `**Entries:** ${entries.length}\n\n` +
          `Congratulations to the winners! Please contact the host to claim your prize.`
        );

        // Edit the original message
        await message.edit({ embeds: [embed], components: [] });

        // Send follow-up message
        await channel.send({
          content: `🎊 ${winnersMention} won **${giveaway.prize}**!`,
          allowedMentions: { users: winners.map(w => w.user_id) }
        });

      } catch (err) {
        console.error(`Error ending giveaway ${giveaway.message_id}:`, err);
      }
    }
  }, 30000); // Check every 30 seconds
}

module.exports = { startGiveawayManager };