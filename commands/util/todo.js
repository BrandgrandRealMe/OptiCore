const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    time,
    TimestampStyles
  } = require('discord.js');
  const db = require('../../utils/DB/publicTodoDB.js');
  const config = require('../../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('todo')
      .setDescription('Manage your personal to-do list')
      .addSubcommand(sub =>
        sub.setName('add')
          .setDescription('Add a new task')
          .addStringOption(opt =>
            opt.setName('task')
              .setDescription('The task description')
              .setRequired(true))
          .addStringOption(opt =>
            opt.setName('due_date')
              .setDescription('Due date (YYYY-MM-DD)')
              .setRequired(false)))
      .addSubcommand(sub =>
        sub.setName('list')
          .setDescription('List your tasks')
          .addStringOption(opt =>
            opt.setName('filter')
              .setDescription('Filter tasks (default: open)')
              .addChoices(
                { name: 'Open', value: 'open' },
                { name: 'Completed', value: 'completed' },
                { name: 'All', value: 'all' }
              )))
      .addSubcommand(sub =>
        sub.setName('complete')
          .setDescription('Mark a task as completed')
          .addIntegerOption(opt =>
            opt.setName('id')
              .setDescription('The task ID')
              .setRequired(true)))
      .addSubcommand(sub =>
        sub.setName('remove')
          .setDescription('Remove a task')
          .addIntegerOption(opt =>
            opt.setName('id')
              .setDescription('The task ID')
              .setRequired(true))),
  
    async execute(interaction) {
      try {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
  
        if (subcommand === 'add') {
          const task = interaction.options.getString('task');
          const dueDateStr = interaction.options.getString('due_date');
          let dueDate = null;
  
          if (dueDateStr) {
            const date = new Date(dueDateStr);
            if (isNaN(date)) {
              return interaction.reply({
                content: '❌ Invalid due date format! Use YYYY-MM-DD.',
                ephemeral: true
              });
            }
            dueDate = date.getTime();
          }
  
          const result = db.prepare(`
            INSERT INTO public_todos (user_id, task, due_date)
            VALUES (?, ?, ?)
          `).run(userId, task, dueDate);
  
          const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('Task Added')
            .setDescription(`**ID:** ${result.lastInsertRowid}\n**Task:** ${task}${dueDate ? `\n**Due:** ${time(Math.floor(dueDate / 1000), TimestampStyles.ShortDate)}` : ''}`);
  
          return interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        }
  
        if (subcommand === 'list') {
          const filter = interaction.options.getString('filter') || 'open';
          let query = 'SELECT * FROM public_todos WHERE user_id = ?';
          if (filter === 'open') query += ' AND completed = 0';
          if (filter === 'completed') query += ' AND completed = 1';
          // 'all' includes both
  
          const tasks = db.prepare(query).all(userId);
  
          if (tasks.length === 0) {
            return interaction.reply({
              content: `No ${filter} tasks found.`,
              ephemeral: true
            });
          }
  
          const embed = new EmbedBuilder()
            .setColor(config.bot.color)
            .setTitle(`Your To-Do List (${filter.charAt(0).toUpperCase() + filter.slice(1)})`)
            .setDescription(
              tasks.map(t => {
                const status = t.completed ? '✅' : '⬜';
                const due = t.due_date ? ` | Due: ${time(Math.floor(t.due_date / 1000), TimestampStyles.ShortDate)}` : '';
                return `${status} **ID: ${t.id}** - ${t.task}${due}`;
              }).join('\n')
            );
  
          return interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        }
  
        if (subcommand === 'complete') {
          const taskId = interaction.options.getInteger('id');
          const task = db.prepare('SELECT * FROM public_todos WHERE id = ? AND user_id = ?').get(taskId, userId);
  
          if (!task) {
            return interaction.reply({
              content: '❌ Task not found or you don\'t own it!',
              ephemeral: true
            });
          }
  
          if (task.completed) {
            return interaction.reply({
              content: '❌ Task is already completed!',
              ephemeral: true
            });
          }
  
          db.prepare(`
            UPDATE public_todos 
            SET completed = 1, completed_at = ? 
            WHERE id = ? AND user_id = ?
          `).run(Date.now(), taskId, userId);
  
          const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('Task Completed')
            .setDescription(`**ID:** ${taskId}\n**Task:** ${task.task}`);
  
          return interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        }
  
        if (subcommand === 'remove') {
          const taskId = interaction.options.getInteger('id');
          const task = db.prepare('SELECT * FROM public_todos WHERE id = ? AND user_id = ?').get(taskId, userId);
  
          if (!task) {
            return interaction.reply({
              content: '❌ Task not found or you don\'t own it!',
              ephemeral: true
            });
          }
  
          db.prepare('DELETE FROM public_todos WHERE id = ? AND user_id = ?').run(taskId, userId);
  
          const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('Task Removed')
            .setDescription(`**ID:** ${taskId}\n**Task:** ${task.task}`);
  
          return interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        }
      } catch (err) {
        console.error(`Error executing todo command for user ${interaction.user.id}:`, err);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription('❌ An error occurred while processing your to-do command. Please try again later.');
  
        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true
        });
      }
    }
  };