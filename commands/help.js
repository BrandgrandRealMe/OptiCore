const {
    SlashCommandBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder
  } = require('discord.js');
  const config = require('../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('List all commands by category using a menu'),
  
    async execute(interaction) {
      const grouped = {};
  
      // group commands by category
      interaction.client.commands.forEach(cmd => {
        const cat = cmd.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({
          name: cmd.data.name,
          desc: cmd.data.description
        });
      });
  
      const categories = Object.entries(grouped);
  
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help-menu')
        .setPlaceholder('Select a category')
        .addOptions(
          categories.map(([cat], i) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(cat)
              .setValue(cat)
              .setDescription(`View commands in ${cat}`)
          )
        );
  
      const row = new ActionRowBuilder().addComponents(selectMenu);
  
      const helpEmbed = new EmbedBuilder()
        .setTitle(`${config.bot.name} | Help`)
        .setDescription('Use the menu below to browse command categories.\n\nThis message will expire in 30 seconds.')
        .setColor(config.bot.color);
  
      const message = await interaction.reply({
        embeds: [helpEmbed],
        components: [row],
        ephemeral: true
      });
  
      // Set timeout to delete the message after 30 seconds
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.error('Failed to delete help message:', error);
        }
      }, 30000); // 30 seconds
  
      const collector = message.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 30_000 // Match the 30 second timeout
      });
  
      collector.on('collect', async i => {
        const selected = i.values[0];
        const cmds = grouped[selected];
  
        const embed = new EmbedBuilder()
          .setTitle(`${config.bot.name} | ${selected}`)
          .setColor(config.bot.color)
          .addFields(
            cmds.map(c => ({
              name: `/${c.name}`,
              value: c.desc || 'No description.',
              inline: false
            }))
          );
  
        await i.update({ embeds: [embed], components: [row] });
      });
  
      collector.on('end', async () => {
        try {
          if (message.editable) {
            const disabledRow = ActionRowBuilder.from(row).setComponents(
              row.components.map(m =>
                StringSelectMenuBuilder.from(m).setDisabled(true)
              )
            );
            await message.edit({ components: [disabledRow] });
          }
        } catch (error) {
          console.error('Failed to disable help menu:', error);
        }
      });
    }
  };