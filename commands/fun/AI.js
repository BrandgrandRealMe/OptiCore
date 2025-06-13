const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    AttachmentBuilder
  } = require('discord.js');
  const aiUsageDb = require('../../utils/DB/aiUsageDB.js');
  const { generateImage } = require('../../utils/AI/hercaiImageGenerator.js');
  const config = require('../../config/settings.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('ai')
      .setDescription('AI commands')
      .addSubcommand(sub =>
        sub.setName('generateimage')
          .setDescription('Generate an image from a prompt')
          .addStringOption(opt =>
            opt.setName('prompt')
              .setDescription('The image description (e.g., "futuristic city at night")')
              .setRequired(true))),
  
    async execute(interaction) {
      try {
        await interaction.deferReply({ ephemeral: false }); // Public reply
  
        const prompt = interaction.options.getString('prompt');
  
        // Generate image
        let imageBuffer;
        try {
          imageBuffer = await generateImage(prompt);
        } catch (err) {
          aiUsageDb.prepare(`
            INSERT INTO ai_usage (user_id, prompt, success, error_message)
            VALUES (?, ?, ?, ?)
          `).run(interaction.user.id, prompt, 0, err.message);
          throw err;
        }
  
        // Create attachment
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });
  
        // Log successful usage
        aiUsageDb.prepare(`
          INSERT INTO ai_usage (user_id, prompt, image_url, success)
          VALUES (?, ?, ?, ?)
        `).run(interaction.user.id, prompt, 'attachment://image.png', 1);
  
        // Create embed
        const embed = new EmbedBuilder()
          .setTitle('AI Generated Image')
          .setDescription(`**Prompt:** ${prompt}`)
          .setImage('attachment://image.png')
          .setColor(config.bot.color)
          .setFooter({ text: `Generated for ${interaction.user.tag} via Herc.ai` })
          .setTimestamp();
  
        await interaction.editReply({
          embeds: [embed],
          files: [attachment],
          ephemeral: false // Public reply
        });
      } catch (err) {
        console.error(`Error executing ai generateimage for user ${interaction.user.id}:`, err);
        const errorEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setDescription(`❌ An error occurred while generating the image: ${err.message || 'Unknown error'}`);
  
        await interaction.editReply({
          embeds: [errorEmbed],
          ephemeral: false // Public error
        });
      }
    }
  };