const config = require("../bot-settings.json");
const { certUpdate } = require('../functions/update-certification');
const { botReply, getEmoji, embedMessage } = require("../teaBot");

module.exports.help = {
    name: "certupdate",
    description: "Manual certification database update",
    type: "administrator",
    usage: `**${config.BotPrefix}certupdate**`
};

module.exports.run = async (bot, message, args) => {
    certUpdate()
        .then(results => {
            console.debug(`✅ tea!certupdate used by '${message.author.tag}'`, results);
            return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 Certification has been updated!\n${results}`, message.author), message, 10000);
        })
        .catch(error => {
            console.error(`🔴 tea!certupdate used by '${message.author.tag}' ❌ ${error.message}`)
            return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'TEA')} 👉 ERROR to update certification:\n🔴 **${error.code}**`, message.author), message, 20000);
        });
}