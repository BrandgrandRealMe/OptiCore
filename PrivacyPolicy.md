# OptiCore Privacy Policy

Last Updated: June 12, 2025

This Privacy Policy outlines how OptiCore (the "Bot") collects, uses, stores, and protects user data when interacting with its features in Discord servers. By using the Bot, you consent to the data practices described in this policy.

## 1. Data We Collect
OptiCore collects the following types of data to provide its features:
- **User IDs**: Discord user IDs are stored to associate actions like giveaway entries, poll votes, reminders, and to-do tasks with specific users.
- **Interaction Data**:
  - **Giveaways**: User IDs, entry timestamps, and giveaway details (e.g., prize, end time) are stored.
  - **Polls**: User IDs, vote choices, and vote timestamps are recorded.
  - **Reminders**: User IDs, reminder messages, and due times are saved.
  - **To-Do Lists**: User IDs, task descriptions, due dates, and completion status are stored for both public (`/todo`) and owner-specific (`/bot-todo`) tasks.
  - **AI Image Generation**: User IDs, prompts, and success/failure status are logged. Generated images are not stored but are referenced as Discord attachments.
  - **Suggestions**: User IDs, suggestion content, and submission timestamps are stored and sent to a designated channel.
- **Server Data**: Guild IDs and channel IDs are stored for giveaways, polls, and suggestions to ensure proper functionality within specific servers.
- **Timestamps**: Creation, completion, or interaction times are recorded for time-sensitive features (e.g., reminders, giveaways, polls).

## 2. How We Use Data
Collected data is used solely to provide and improve the Bot's functionality:
- **Giveaways and Polls**: To track entries/votes and select winners or display results.
- **Reminders and To-Do Lists**: To send notifications and manage tasks for users.
- **AI Image Generation**: To log usage for moderation and debugging purposes.
- **Suggestions**: To allow the bot owner to review and respond to user feedback.
- **Error Handling**: User IDs and timestamps help diagnose issues when errors occur.

## 3. Data Storage
- **Database**: Data is stored in SQLite databases (`./data/*.db`) on the server hosting the Bot. Databases include `giveaways.db`, `polls.db`, `reminders.db`, `public_todos.db`, `todos.db`, and `ai_usage.db`.
- **Retention**: Data is retained only as long as necessary for the feature to function:
  - Giveaway and poll data is marked as ended but may persist for record-keeping unless manually deleted.
  - Reminder data is marked as sent after delivery and may be retained for debugging.
  - To-do list data persists until explicitly removed by the user.
  - AI usage logs persist for moderation and debugging but do not store images.
- **Security**: Data is stored locally on the hosting server with no external access unless explicitly shared (e.g., suggestion embeds in a designated channel). The Bot owner ensures reasonable security measures to protect data.

## 4. Data Sharing
- **Public Display**: Some data is displayed publicly in Discord channels as part of the Bot's functionality:
  - Giveaway winners are announced with user mentions.
  - Poll results show aggregated vote counts (not individual votes).
  - Suggestions are sent to a designated channel with the submitter's user tag and ID.
- **Third Parties**: The `/ai generateimage` command uses the Herc.ai API, which receives the user-provided prompt. No other user data is shared with Herc.ai. Refer to Herc.ai's privacy policy for their data handling practices.
- **Bot Owner**: The bot owner (Discord ID: 531186390717825074) may access stored data for maintenance, debugging, or responding to suggestions.

## 5. User Rights
- **Access and Deletion**: Users may request access to or deletion of their stored data by contacting the bot owner. Note that deleting data may affect features like active giveaway entries or pending reminders.
- **Opt-Out**: Users can opt out of data collection by not using the Bot's commands. Server administrators can remove the Bot from their server to prevent further data collection.

## 6. Data Security
- The Bot uses SQLite databases with appropriate indexes for efficient data access.
- The hosting server is maintained by the bot owner with reasonable security practices, though no system is entirely secure.
- Sensitive data like the Discord token and Herc.ai API key are stored in environment variables and not exposed in the codebase.

## 7. Children's Privacy
OptiCore is not intended for users under 13 years of age, in compliance with Discord's Terms of Service and the Children's Online Privacy Protection Act (COPPA). If you are under 13, do not use the Bot.

## 8. Changes to This Policy
This Privacy Policy may be updated to reflect changes in the Bot's functionality or legal requirements. Significant changes will be announced in servers where the Bot is active, where feasible. Continued use of the Bot after changes constitutes acceptance of the updated policy.

## 9. Contact
For questions or concerns about this Privacy Policy, contact the bot owner (Discord ID: 531186390717825074) or use the `/suggestion` command to provide feedback.

By using OptiCore, you acknowledge that you have read, understood, and consent to this Privacy Policy.