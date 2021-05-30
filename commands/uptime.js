const { getEmoji, botReply, convertMsToTime } = require("../teaBot");
const config = require("../bot-settings.json");

module.exports.help = {
    name: "uptime",
    description: "Current uptime of the bot.",
    type: "public",
    usage: `ℹ️ Format: **${config.botDetails.prefix}uptime**`
};

module.exports.run = async (bot, message) => {
    return botReply(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} Current TEA bot uptime: **${convertMsToTime(bot.uptime)}**.`, message);
};