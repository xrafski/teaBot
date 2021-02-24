const { botReply, getEmoji } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = {
    name: "total",
    description: "Display total amount of users on all servers.",
    type: "botowner",
    usage: `ℹ️ Format: **${config.prefixPlaceholder}total**`
};

module.exports.run = async (bot, message) => {
    let memberCount = 0;
    for (const guild of bot.guilds.cache) memberCount = memberCount + guild[1].memberCount;
    botReply(`${getEmoji(config.TEAserverID, 'TEA')} ${memberCount} total users (non-unique)`, message);
}