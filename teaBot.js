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

// Login the bot
setTimeout(() => {


    MongoClient()
        .then(() => client.login(token))
        .catch(error => { logger('error', `teaBot.js (x) Error to initialize client.`, error) });


    // client.login(token)
    //     .then(cl => MongoClient())
    //     .catch(error => { });

    // console.log(client.slashCommands);
}, 2000);



// client.login(token)
//     .then(cl => {
//         logger('debug', `teaBot.js (2) Client logged in successfully`) && console.log(cl);

//         MongoClient() // Connect to MongoDB
//             .then(() => {

//             })
//             .catch(error => {
//                 logger('error', 'teaBot.js (1) MongoClient() Error to connect to the MongoDB', error);
//             });

//     })
//     .catch(console.error);







module.exports = client;