const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    time,
    TimestampStyles
  } = require('discord.js');
  const db = require('../../utils/DB/reminderDB.js');
  const config = require('../../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('remindme')
      .setDescription('Set a personal reminder')
      .addStringOption(opt =>
        opt.setName('time')
          .setDescription('Time until reminder (e.g., 1min, 2h, 3d)')
          .setRequired(true))
      .addStringOption(opt =>
        opt.setName('message')
          .setDescription('The reminder message')
          .setRequired(true)),
  
    async execute(interaction) {
      try {
        const timeInput = interaction.options.getString('time').toLowerCase();
        const message = interaction.options.getString('message');
  
        // Parse time input
        const timeRegex = /^(\d+)(s|min|h|d)$/;
        const match = timeInput.match(timeRegex);
        if (!match) {
          return interaction.reply({
            content: '❌ Invalid time format! Use formats like `1s`, `5min`, `2h`, or `3d`.',
            ephemeral: true
          });
        }
  
        const value = parseInt(match[1]);
        const unit = match[2];
        let milliseconds;
  
        switch (unit) {
          case 's': milliseconds = value * 1000; break;
          case 'min': milliseconds = value * 60 * 1000; break;
          case 'h': milliseconds = value * 60 * 60 * 1000; break;
          case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
        }
  
        // Validate time
        if (milliseconds < 1000 || milliseconds > 30 * 24 * 60 * 60 * 1000) { // 1 second to 30 days
          return interaction.reply({
            content: '❌ Time must be between 1 second and 30 days!',
            ephemeral: true
          });
        }
  
        const dueTime = Date.now() + milliseconds;
  
        // Store reminder
        const result = db.prepare(`
          INSERT INTO reminders (user_id, message, due_time)
          VALUES (?, ?, ?)
        `).run(interaction.user.id, message, dueTime);
  
        // Create embed
        const embed = new EmbedBuilder()
          .setColor(config.bot.color)
          .setTitle('Reminder Set')
          .setDescription(
            `**Message:** ${message}\n` +
            `**Due:** ${time(Math.floor(dueTime / 1000), TimestampStyles.RelativeTime)}\n` +
            `**ID:** ${result.lastInsertRowid}`
          )
          .setFooter({ text: `You'll receive a DM when the reminder is due.` });
  
        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      } catch (err) {
        console.error(`Error executing remindme for user ${interaction.user.id}:`, err);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription('❌ An error occurred while setting your reminder. Please try again later.');
  
        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true
        });
      }
    }
  };