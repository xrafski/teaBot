const { Client, Collection, Intents } = require("discord.js");

const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Global Variables
// client.commands = new Collection(); // Regular commands collector
client.slashCommands = new Collection(); // Slash commands collector
client.config = require("./Utilities/settings/bot.json");
const { token } = require("./Utilities/settings/secret/settings.json"); // Secret file with bot's token

// Initializing the project
['Events', 'Commands'].forEach(handler => {
    require(`./Handlers/${handler}`)(client);
});

client.login(token);
module.exports = client;