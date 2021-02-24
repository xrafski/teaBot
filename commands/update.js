const config = require("../bot-settings.json");
// const { updGuidelines } = require("../events/update-guidelines");
const { certUpdate } = require("../functions/update-certification");
const { threatUpdate } = require("../functions/update-threat-database");
const { botReply, getEmoji, embedMessage, logger } = require("../teaBot");

module.exports.help = {
    name: "update",
    description: "Manual request to update various bot functions.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.prefixPlaceholder}update functionName**\nℹ️ Available functions(s): certification, blacklist\nℹ️ Example(s):\n${config.prefixPlaceholder}update certification\n${config.prefixPlaceholder}update blacklist`
};

module.exports.run = async (bot, message, args, prefix) => {

    switch (args[0]?.toLowerCase()) {
        // case 'guidelines': {
        //     if (message.channel.name === config.guidelines.channelName) return botReply(`You can't use this command in this channel, try somewhere else!`, message);
        //     logger('update', `Guidelines Update [Manual]`);
        //     botReply(`${getEmoji(config.TEAserverID, 'TEA')} Requested guidelines update...`, message);
        //     return updGuidelines();
        // }
        case 'certification': {
            return certUpdate()
                .then(results => {
                    logger('update', `update.js:1 () 👉 Certification Update [Manual]`, results.info);
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 Certification has been updated!\n${results.info}`, message.author), message);
                })
                .catch(error => {
                    logger('error', `update.js:2 () 👉 Certification Update [Manual]'`, error);
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 ERROR to update certification:\n🔴 **${error.code}**`, message.author), message);
                });
        }
        case 'blacklist': {
            return threatUpdate()
                .then(results => {
                    logger('update', `update.js:3 () 👉 Threat Database Update [Manual]`, results.info);
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 Threat Database has been updated!\n${results.info}`, message.author), message);
                })
                .catch(error => {
                    logger('error', `update.js:4 () 👉 Threat Database Update [Manual]`, error);
                    return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 ERROR to update threat database:\n🔴 **${error.code}**`, message.author), message);
                });
        }
        default: return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    }
}