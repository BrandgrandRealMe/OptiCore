# OptiCore Discord Bot

## Overview
OptiCore is a versatile Discord bot designed to enhance server engagement and management through a variety of interactive and utility commands. Built with Discord.js, it offers features like giveaways, polls, to-do lists, moderation tools, AI-generated images, and more. The bot is highly configurable and uses SQLite for data persistence, ensuring reliable storage for user interactions such as giveaway entries, poll votes, and reminders.

## Features
- **Giveaways**: Create and manage giveaways with customizable prizes, durations, and winner counts. Users can enter via button interactions, and winners are automatically selected when giveaways end.
- **Polls**: Set up polls with up to five options and track votes in real-time. Results are displayed when polls conclude.
- **To-Do Lists**: Manage personal and bot owner-specific to-do lists with options to add, list, complete, and remove tasks.
- **Moderation**: Includes commands like `/ban`, `/kick`, and `/clear` for server management, restricted to users with appropriate permissions.
- **AI Image Generation**: Generate images from text prompts using the Herc.ai API with the `/ai generateimage` command.
- **Reminders**: Set personal reminders with customizable time durations (e.g., seconds, minutes, hours, days).
- **Utility Commands**: Access server info, user info, avatars, and bot status with commands like `/serverinfo`, `/userinfo`, `/avatar`, and `/ping`.
- **Suggestions**: Submit suggestions for bot improvements, which are sent to a designated channel for review by the bot owner.
- **Dynamic Status**: The bot rotates through various status messages to keep the server lively.

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd opticore
   ```

2. **Install Dependencies**:
   Ensure Node.js is installed, then run:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Copy `.env.template` to `.env` and fill in the required variables:
     - `DISCORD_TOKEN`: Your Discord bot token.
     - `HERCAI_API_KEY`: API key for Herc.ai image generation (if using the AI feature).
   - Update `config/settings.js` with your Discord Client ID, Guild ID, and other settings as needed.

4. **Set Up Database**:
   - The bot uses SQLite databases located in the `./data` directory for giveaways, polls, reminders, to-do lists, and AI usage tracking. These are automatically created on first run.

5. **Deploy Commands**:
   - Run `npm start` to deploy slash commands and start the bot. Commands can be deployed globally or to a specific guild based on the `DEPLOY_SCOPE` setting in `config/settings.js`.

6. **Run the Bot**:
   - The bot will log in and start processing commands and events. Ensure the bot has the necessary permissions in your Discord server (e.g., `Manage Messages` for moderation commands).

## Command List
- **Bot**: `/suggestion` - Submit suggestions for bot improvements.
- **Dev**: `/bot-todo` - Manage the bot owner's to-do list (owner-only).
- **Fun**: `/ai generateimage` - Generate images from text prompts.
- **Giveaways**:
  - `/giveaway` - Start a new giveaway.
  - `/giveaway-end` - End a giveaway early.
  - `/giveaway-list` - List active giveaways.
  - `/reroll` - Reroll a giveaway winner.
- **Help**: `/help` - Display all commands by category using an interactive menu.
- **Moderation**:
  - `/ban` - Ban a user from the server.
  - `/kick` - Kick a user from the server.
  - `/clear` - Delete a specified number of messages.
- **Polls**: `/poll` - Create a new poll with multiple options.
- **Utility**:
  - `/ping` - Check the bot's latency and system status.
  - `/avatar` - Display a user's avatar.
  - `/remindme` - Set a personal reminder.
  - `/serverinfo` - Display server information.
  - `/todo` - Manage a personal to-do list.
  - `/userinfo` - Display user information.

## Contributing
Contributions are welcome! Please fork the repository, make your changes, and submit a pull request. Ensure your code follows the existing structure and includes appropriate error handling.

## License
OptiCore is licensed under the [MIT License](LICENSE). See the LICENSE file for details.

## Support
For issues or feature requests, submit a suggestion using the `/suggestion` command or contact the bot owner (ID: 531186390717825074) on Discord.

## Privacy and Data
OptiCore stores minimal user data (e.g., user IDs, giveaway entries, poll votes, reminders, and to-do tasks) in SQLite databases to provide its features. See the [Privacy Policy](#privacy-policy) for details on data handling.