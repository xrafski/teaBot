/* eslint-disable no-inline-comments */
const { Client, Collection, Intents } = require('discord.js');
const { MongoClient } = require('./Handlers/Mongoose');
const logger = require('./Utilities/logger');
const { token } = require('./Utilities/settings/secret/settings.json'); // Secret file with bot's token

const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// require('./Utilities/functions')(client);

// Global Variables
// client.commands = new Collection(); // Regular commands collector
client.slashCommands = new Collection(); // Slash commands collector
client.config = require('./Utilities/settings/bot.json');

// Initializing the project
require('./Handlers/Mongoose'); // Load MongoDB connection listener.
require('./Handlers/Error'); // Load some application process listeners.

['Events', 'Commands'].forEach((handler) => {
	require(`./Handlers/${handler}`)(client);
});

// Client login
setTimeout(() => {
	MongoClient()
		.then(() => client.login(token))
		.catch((error) => {
			logger('error', 'teaBot.js (1) Error to initialize client.', error);
		});
}, 2000);

// module.exports = client;
module.exports = client;
