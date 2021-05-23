const { botReply, getEmoji, embedMessage, logger } = require("../teaBot");
const config = require("../bot-settings.json");
const { certUpdate } = require("../functions/update-certification");
const { threatUpdate } = require("../functions/update-threat-database");

module.exports.help = {
    name: "update",
    description: "Manual request to update various bot functions.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.botDetails.prefix}update functionName**\nℹ️ Available functions(s): certification, blacklist\nℹ️ Example(s):\n${config.botDetails.prefix}update certification\n${config.botDetails.prefix}update blacklist`
};

module.exports.run = async (bot, message, args) => {

    switch (args[0]?.toLowerCase()) {
        case 'certification': {
            return certUpdate()
                .then(results => {
                    logger('update', `update.js:1 () 👉 Certification Update [Manual]`, results.info);
                    return botReply(embedMessage(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} 👉 Certification has been updated!\n${results.info}`, message.author), message);
                })
                .catch(error => {
                    logger('error', `update.js:2 () 👉 Certification Update [Manual]'`, error);
                    return botReply(embedMessage(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} 👉 ERROR to update certification:\n🔴 **${error.code}**`, message.author), message);
                });
        }
        case 'blacklist': {
            return threatUpdate()
                .then(results => {
                    logger('update', `update.js:3 () 👉 Threat Database Update [Manual]`, results.info);
                    return botReply(embedMessage(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} 👉 Threat Database has been updated!\n${results.info}`, message.author), message);
                })
                .catch(error => {
                    logger('error', `update.js:4 () 👉 Threat Database Update [Manual]`, error);
                    return botReply(embedMessage(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} 👉 ERROR to update threat database:\n🔴 **${error.code}**`, message.author), message);
                });
        }
        default: return botReply(`Wrong command format, type **${config.botDetails.prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    }
};