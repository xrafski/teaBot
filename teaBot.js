/* eslint-disable no-inline-comments */
const { Client, Collection, Intents } = require('discord.js');
const logger = require('./Utilities/logger');
const { token } = require('./Utilities/settings/secret/settings.json'); // Secret file with bot's token

const fs = require('fs');

const mongoose = require('mongoose');
const { mongoURI } = require('./Utilities/settings/secret/settings.json'); // Secret file with bot's MongoDB Connection String

const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Global Variables
client.commands = new Collection(); // Regular commands collector
client.slashCommands = new Collection(); // Slash commands collector
client.config = require('./Utilities/settings/bot.json');

// Initializing the project
// ['Command', 'Error', 'Event', 'Mongoose'].forEach(handler => {
// 	require(`./Handler/${handler}`)(client);
// });

function loadProjectHandlers() {
	return new Promise((resolve, reject) => {
		fs.readdir('./Handler', (err, files) => {
			if (err) return reject(err);
			files.forEach(handler => require(`./Handler/${handler}`)(client));
			logger.debug(`teaBot.js (1) Application finished loading handlers (${files.length} files).`);
			resolve(`Application finished loading handlers (${files.length} files).`);
		});
	});
}

loadProjectHandlers() // Initialize the project.
	.then(() => {
		setTimeout(async () => { // After 5 seconds try to connect to Mongo
			await mongoose.connect(mongoURI, {
				maxPoolSize: 10,
				keepAlive: true,
				socketTimeoutMS: 30000,
				serverSelectionTimeoutMS: 10000,
			})
				.then(() => client.login(token).catch(err => logger.error('teaBot.js(2) Error to login the bot', err)))
				.catch(err => logger.error('teaBot.js (3) Project initial error to connect to MongoDB', err));
		}, 5000);
	})
	.catch(err => logger.error('teaBot.js (4) Error to initialize the project handlers.', err));

module.exports = client;