const db = require('./DB/pollDB.js');
const { EmbedBuilder } = require('discord.js');

async function startPollManager(client) {
    console.log('Starting poll manager...');
    setInterval(async () => {
        const now = Date.now();
        console.log(`Checking polls at ${new Date(now).toISOString()}`);
        const polls = db.prepare('SELECT * FROM polls WHERE end_time <= ? AND ended = 0').all(now);
        if (polls.length < 1) {
            console.log(`Found ${polls.length} polls to process:`, polls);
        }


        for (const poll of polls) {
            try {
                console.log(`Processing poll ${poll.message_id} for ${poll.question}`);
                const channel = await client.channels.fetch(poll.channel_id);
                if (!channel) {
                    console.log(`Channel ${poll.channel_id} not found for poll ${poll.message_id}`);
                    db.prepare('UPDATE polls SET ended = 1 WHERE message_id = ?').run(poll.message_id);
                    continue;
                }

                const message = await channel.messages.fetch(poll.message_id).catch(() => null);
                if (!message) {
                    console.log(`Message ${poll.message_id} not found in channel ${poll.channel_id}`);
                    db.prepare('UPDATE polls SET ended = 1 WHERE message_id = ?').run(poll.message_id);
                    continue;
                }

                const votes = db.prepare('SELECT option_index, COUNT(*) as count FROM poll_votes WHERE message_id = ? GROUP BY option_index').all(poll.message_id);
                const options = JSON.parse(poll.options);

                // Mark as ended

                try {
                    db.prepare('UPDATE polls SET ended = 1 WHERE message_id = ?').run(poll.message_id);
                } catch (err) {
                    console.error('Database error:', err);
                    return;
                }
                // Calculate results
                const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);
                const results = options.map((opt, i) => {
                    const voteCount = votes.find(v => v.option_index === i)?.count || 0;
                    const percentage = totalVotes ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
                    return `${i + 1}. ${opt} - ${voteCount} votes (${percentage}%)`;
                });

                // Update embed
                const embed = new EmbedBuilder(message.embeds[0].data)
                    .setTitle(`📊 ${poll.question} - ENDED`)
                    .setDescription(
                        results.join('\n') +
                        `\n\n**Total Votes:** ${totalVotes}\n**Ended:** <t:${Math.floor(poll.end_time / 1000)}:R>`
                    )
                    .setColor(0xFF0000);

                await message.edit({ embeds: [embed], components: [] });
                console.log(`Edited poll message ${poll.message_id} with results`);

                await channel.send(`The poll **${poll.question}** has ended! Results are above.`);

            } catch (err) {
                console.error(`Error ending poll ${poll.message_id}:`, err);
            }
        }
    }, 30000); // Check every 30 seconds
}

module.exports = { startPollManager };