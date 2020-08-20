const config = require("../bot-settings.json");
const { TEAemoji } = require("../tea");

module.exports.help = {
    name: "say",
    description: ".........",
    type: "public",
    usage: `**${config.BotPrefix}say text**`
};

module.exports.run = async (bot, message, args) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                         guilds                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args) {
        return message.channel.send(args.join(" "));
    }
}