const config = require("../bot-settings.json");
const { embedMessage, botReply } = require("../teaBot");

module.exports.help = {
    name: "say",
    description: "Sends a message as the bot.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.BotPrefix}say embed(optional) messageToSend**\n\nℹ️ Example(s):\n${config.BotPrefix}say Hello 👋\n${config.BotPrefix}say embed Hello 👋`
};

module.exports.run = async (bot, message, args) => {
    if (args[0] === 'embed') return message.channel.send(embedMessage(args.splice(1).join(' '), message.author)).catch(error => console.error(`say.js:1 ${error}`));
    else if (args[0]) return message.channel.send(args.join(" ")).catch(error => console.error(`say.js:2 ${error}`));
    else return botReply(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`, message, 10000);
}