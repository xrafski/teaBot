const config = require("../bot-settings.json");
const { updGuidelines } = require("../events/update-guidelines");
const { logger } = require("../functions/logger");
const { certUpdate } = require("../functions/update-certification");
const { treadUpdate } = require("../functions/update-tread-database");
const { botReply, getEmoji, embedMessage } = require("../teaBot");

module.exports.help = {
    name: "update",
    description: "Manual request to update various bot functions.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.botPrefix}update functionName**\n\nℹ️ Example(s):\n${config.botPrefix}update guidelines\n${config.botPrefix}update certification\n${config.botPrefix}update blacklist`
};

module.exports.run = async (bot, message, args) => {

    switch (args[0]?.toLowerCase()) {
        // case 'guidelines': {
        //     if (message.channel.name === config.guidelines.channelName) return botReply(`You can't use this command in this channel, try somewhere else!`, message, 5000);
        //     logger('update', `Guidelines Update [Manual]`, null, 'white');
        //     botReply(`${getEmoji(config.TEAserverID, 'TEA')} Requested guidelines update...`, message, 10000);
        //     return updGuidelines();
        // }
        case 'certification': {
            return certUpdate()
                .then(results => {
                    logger('update', `update.js:1 () Certification Update [Manual]`, results.info, 'green');
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 Certification has been updated!\n${results.info}`, message.author), message, 10000);
                })
                .catch(error => {
                    logger('error', `update.js:2 () Certification Update [Manual]'`, error);
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 ERROR to update certification:\n🔴 **${error.code}**`, message.author), message, 10000);
                });
        }
        case 'blacklist': {
            return treadUpdate()
                .then(results => {
                    logger('update', `update.js:3 () Guidelines Update [Manual]`, results.info, 'green');
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 Thread Database has been updated!\n${results.info}`, message.author), message, 10000);
                })
                .catch(error => {
                    logger('error', `update.js:4 () Guidelines Update [Manual]`, error);
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 ERROR to update thread database:\n🔴 **${error.code}**`, message.author), message, 10000);
                });
        }
        default: return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message, 10000);
    }
}