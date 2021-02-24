const config = require("../bot-settings.json");
const { embedMessage, botReply, logger } = require("../teaBot");

module.exports.help = {
    name: "say",
    description: "Send message as the bot.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.prefixPlaceholder}say embed(optional) messageToSend**\nℹ️ Example(s):\n${config.prefixPlaceholder}say Hello 👋\n${config.prefixPlaceholder}say embed Hello 👋`
};

module.exports.run = async (bot, message, args, prefix) => {
    if (message.deletable) message.delete({ timeout: 1000 }).catch(error => logger('say.js:1 () Delete the message', error));

    if (args[0] === 'embed') return message.channel.send(embedMessage(args.splice(1).join(' '), message.author))
        .catch(error => logger('error', `say.js:2 () Send the message`, error));
    else if (args[0]) return message.channel.send(args.join(" "))
        .catch(error => logger('error', `say.js:3 () Send the message`, error));
    else return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
}