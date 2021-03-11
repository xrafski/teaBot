const config = require("../bot-settings.json");
const { embedMessage, botReply, logger } = require("../teaBot");

module.exports.help = {
    name: "say",
    description: "Send message as the bot.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.botPrefix}say embed(optional) messageToSend**\nℹ️ Example(s):\n${config.botPrefix}say Hello 👋\n${config.botPrefix}say embed Hello 👋`
};

module.exports.run = async (bot, message, args) => {
    if (message.deletable) message.delete({ timeout: 1000 }).catch(error => logger('say.js:1 () Error to delete the message', error));

    if (args[0] === 'embed') return message.channel.send(embedMessage(args.splice(1).join(' '), message.author))
        .catch(error => logger('error', `say.js:2 () Error to send the message`, error));
    else if (args[0]) return message.channel.send(args.join(" "))
        .catch(error => logger('error', `say.js:3 () Error to send the message`, error));
    else return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);
};