const { botReply } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = {
    name: "test",
    description: "Test TEA systems.",
    type: "serverowner",
    usage: `ℹ️ Format: **${config.botPrefix}test** systemName\n\nℹ️ Example(s):\n${config.botPrefix}test overwatch`
};

module.exports.run = async (bot, message, args) => {
    if (!args[0]) return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);

    switch (args[0].toLowerCase()) {
        case 'overwatch': {
            const memberObj = message.guild.members.cache.get(bot.user.id);
            const logChannel = message.guild.channels.cache.find(channel => channel.name === config.logs.channelName);
            if (!logChannel) return botReply(`Your server is missing '**${config.logs.channelName}**' channel, overwatch won't work without it!`, message);
            if (!memberObj) return botReply(`Unknown error, try again later ;(`, message);

            bot.emit("guildMemberAdd", memberObj);
            return botReply(`Overwatch system test requested!\nType **tea!help overwatch** if you don't see a new message in the #${logChannel} channel channel for setup details.`, message)
        }
        default: return botReply('❌ Unknown system name, you can only test **overwatch** right now.', message);
    }
}