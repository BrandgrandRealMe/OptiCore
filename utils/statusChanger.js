const { ActivityType } = require('discord.js');
const config = require('../config/settings.js');

const statusList = [
  {
    type: ActivityType.Playing,
    text: 'with the API'
  },
  {
    type: ActivityType.Watching,
    text: `${config.bot.version}`
  },
  {
    type: ActivityType.Listening,
    text: '/help'
  },
  {
    type: ActivityType.Competing,
    text: 'in coding challenges'
  },
  {
    type: ActivityType.Watching,
    text: 'over the server'
  },
  {
    type: ActivityType.Playing,
    text: 'with slash commands'
  }
];

module.exports = (client) => {
  let currentIndex = 0;
  const updateInterval = 30000; // 30 seconds

  const updateStatus = () => {
    const status = statusList[currentIndex];
    client.user.setActivity(status.text, { type: status.type });
    
    currentIndex = (currentIndex + 1) % statusList.length;
  };

  // Initial status set
  updateStatus();
  
  // Set up interval for rotation
  const interval = setInterval(updateStatus, updateInterval);
  
  // Cleanup on client destruction
  client.on('destroy', () => {
    clearInterval(interval);
  });

  return interval;
};