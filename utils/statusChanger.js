const { ActivityType } = require('discord.js');
const config = require('../config/settings.js');

// Status list with more variety and dynamic options
const statusList = [
  {
    type: ActivityType.Playing,
    text: 'with the API',
    duration: 30000 // 30 seconds
  },
  {
    type: ActivityType.Watching,
    text: `${config.bot.version}`,
    duration: 25000 // 25 seconds
  },
  {
    type: ActivityType.Listening,
    text: '/help',
    duration: 20000 // 20 seconds
  },
  {
    type: ActivityType.Competing,
    text: 'in coding challenges',
    duration: 35000 // 35 seconds
  },
  {
    type: ActivityType.Watching,
    text: 'over the server',
    duration: 30000 // 30 seconds
  },
  {
    type: ActivityType.Playing,
    text: 'with slash commands',
    duration: 25000 // 25 seconds
  }
];

// Cache the current status index
let currentIndex = 0;
let statusInterval = null;

/**
 * Updates the bot's status with the next activity in the rotation
 * @param {Client} client - Discord.js client instance
 */
const updateStatus = (client) => {
  try {
    const status = statusList[currentIndex];
    
    client.user.setActivity(status.text, { 
      type: status.type,
      url: 'https://twitch.tv/discord' // Only applicable for Streaming type
    });
    
    // Log status change for debugging
    console.log(`Status updated to: ${ActivityType[status.type]} ${status.text}`);
    
    // Move to next status, wrap around if needed
    currentIndex = (currentIndex + 1) % statusList.length;
    
    return status.duration;
  } catch (error) {
    console.error('Error updating status:', error);
    return 30000; // Default fallback duration
  }
};

/**
 * Starts the status rotation
 * @param {Client} client - Discord.js client instance
 */
const startStatusRotation = (client) => {
  // Clear any existing interval to prevent duplicates
  stopStatusRotation();
  
  // Initial status update
  const initialDuration = updateStatus(client);
  
  // Set up the rotation interval
  statusInterval = setInterval(() => {
    const nextDuration = updateStatus(client);
    // Dynamically adjust interval based on status duration
    if (statusInterval) {
      clearInterval(statusInterval);
      statusInterval = setInterval(() => updateStatus(client), nextDuration);
    }
  }, initialDuration);
};

/**
 * Stops the status rotation and cleans up
 */
const stopStatusRotation = () => {
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
  }
};

module.exports = (client) => {
  // Start the initial rotation
  startStatusRotation(client);
  
  // Return cleanup function
  return stopStatusRotation;
};