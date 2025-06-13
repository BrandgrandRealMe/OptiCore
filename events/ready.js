const statusChanger = require('../utils/statusChanger');
const { startGiveawayManager } = require('../utils/giveawayManager');
const { startPollManager } = require('../utils/pollManager');
const { startReminderManager } = require('../utils/reminderManager');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    statusChanger(client);
    startGiveawayManager(client);
    startPollManager(client);
    startReminderManager(client);
  }
};