const { savePrefix } = require("../cache/guild-prefixes");
const { botReply, logger } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = {
    name: "set",
    description: "Change bot settings.",
    type: "serverowner",
    usage: `ℹ️ Format: **${config.prefixPlaceholder}set module argument**\nℹ️ Available module(s): prefix\nℹ️ Example(s):\n${config.prefixPlaceholder}set prefix tea/\n${config.prefixPlaceholder}set prefix yourprefix!`
};

module.exports.run = async (bot, message, args, prefix) => {
    const { guild } = message;
    if (!args[1]) return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    if (args[1].length > 10) return botReply(`Your prefix length(${args[1].length}) is greater than the limit(10). Try again with something shorter.`, message);

    switch (args[0].toLowerCase()) {
        case 'prefix': {
            return savePrefix(guild, args[1]).then((res) => {
                logger('info', `set.js:1 () Prefix for the '${res.data.guild}' guild changed to '${res.data.prefix}'.`);
                botReply(`Guild prefix changed to: **${res.data.prefix}**\n\nFor now use commands with this prefix:\n__${res.data.prefix}__ping • __${res.data.prefix}__uptime • __${res.data.prefix}__club • __${res.data.prefix}__guilds and so on.`, message);
            }).catch(err => {
                logger('error', `set.js:2 () Error to save prefix for the '${guild.name}' guild in the 'prefixes' collection.`, err);
                botReply(`Database error - try again later.`, message);
            });
        }
        default: return botReply(`Unknown module name, type **${prefix}help ${module.exports.help.name}** to see available modules to manipulate using this command.`, message);
    }
}