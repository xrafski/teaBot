const config = require("../bot-settings.json");
const { getEmoji, botReply } = require('../teaBot');

module.exports.help = {
    name: "guilds",
    description: "Amount of guilds the bot is in.",
    type: "public",
    usage: `ℹ️ Format: **${config.botPrefix}guilds**`
};

module.exports.run = async (bot, message) => {
    return botReply(`${getEmoji(config.TEAserverID, 'TEA')} TEA is watching **${Math.round(bot.guilds.cache.size)}** guilds.`, message, 15000);
}