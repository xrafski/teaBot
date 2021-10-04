const { Client, Collection, Intents } = require("discord.js");
const { MongoClient } = require("./Handlers/Mongoose");
const { logger } = require("./Utilities/functions");
const { token } = require("./Utilities/settings/secret/settings.json"); // Secret file with bot's token

const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Global Variables
// client.commands = new Collection(); // Regular commands collector
client.slashCommands = new Collection(); // Slash commands collector
client.config = require("./Utilities/settings/bot.json");

// Initializing the project
require('./Handlers/Mongoose'); // Load MongoDB connection listener.
require('./Handlers/Error'); // Load some application process listeners.

['Events', 'Commands'].forEach(handler => {
    require(`./Handlers/${handler}`)(client);
});

// Client login
setTimeout(() => {
    MongoClient()
        .then(() => client.login(token))
        .catch(error => { logger('error', `teaBot.js (x) Error to initialize client.`, error) });
}, 2000);

module.exports = client;