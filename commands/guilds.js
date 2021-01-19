const config = require("../bot-settings.json");
const { TEAemoji } = require('../teaBot');

module.exports.help = {
    name: "guilds",
    description: "Displays amount of guilds the bot has joined.",
    type: "public",
    usage: `**${config.BotPrefix}guilds**`
};

module.exports.run = async (bot, message) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                         guilds                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    const guildsNumber = Math.round(bot.guilds.cache.size - 1);
    // const memberCount = bot.users.cache.size;
    return message.channel.send(`${TEAemoji()} TEA bot is watching **${guildsNumber}** guilds.`)
        .then(message => message.delete({ timeout: 20000 })).catch(() => { return });
}