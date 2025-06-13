const db = require('./DB/reminderDB.js');
const { EmbedBuilder } = require('discord.js');

async function startReminderManager(client) {
  console.log('Starting reminder manager...');
  setInterval(async () => {
    const now = Date.now();
    console.log(`Checking reminders at ${new Date(now).toISOString()}`);
    const reminders = db.prepare(`
      SELECT * FROM reminders 
      WHERE due_time <= ? AND sent = 0
    `).all(now);

    console.log(`Found ${reminders.length} due reminders`);

    for (const reminder of reminders) {
      try {
        const user = await client.users.fetch(reminder.user_id);
        if (!user) {
          console.log(`User ${reminder.user_id} not found for reminder ${reminder.id}`);
          db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?').run(reminder.id);
          continue;
        }

        const embed = new EmbedBuilder()
          .setColor('#3498db')
          .setTitle('Reminder')
          .setDescription(`**Message:** ${reminder.message}\n**Set:** <t:${Math.floor(reminder.created_at / 1000)}:R>`)
          .setTimestamp();

        await user.send({ embeds: [embed] });
        console.log(`Sent reminder ${reminder.id} to user ${reminder.user_id}`);

        db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?').run(reminder.id);
      } catch (err) {
        console.error(`Error sending reminder ${reminder.id} to user ${reminder.user_id}:`, err);
      }
    }
  }, 30000); // Check every 30 seconds
}

module.exports = { startReminderManager };