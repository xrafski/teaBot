const { botReply, sendEmbedLog, logger, getEmoji } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = {
    name: "test",
    description: "Test TEA systems.",
    type: "serverstaff",
    usage: `ℹ️ Format: **${config.botPrefix}test systemName**\nℹ️ Available systems(s): overwatch, announcements\nℹ️ Example(s):\n${config.botPrefix}test overwatch\n${config.botPrefix}test announcements`
};

module.exports.run = async (bot, message, args) => {
    if (!args[0]) return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    const { guild } = message;

    switch (args[0].toLowerCase()) {
        case 'overwatch': {
            const logChannel = guild.channels.cache.find(channel => channel.name === config.logs.channelName);
            if (!logChannel) return botReply(`Your server is missing '**${config.logs.channelName}**' channel, overwatch won't work without it!`, message);

            bot.emit("guildMemberAdd", guild.members.cache.get(bot.user.id));
            return botReply(`Overwatch system test requested!\nType **${config.botPrefix}help overwatch** if you don't see a new message in the ${logChannel} channel for setup details.`, message);
        }
        case 'announcements': {
            const announcementsChannel = guild.channels.cache.find(channel => channel.name === config.announcements.channelName);
            if (!announcementsChannel) return botReply(`Your server is missing '**${config.announcements.channelName}**' channel, and you won't receive announcements without it!`, message);

            sendEmbedLog(`Feel free to remove this test message.\n\nSet ✅ **Use External Emoji** permission in the ${announcementsChannel} channel for ${bot.user} bot and everyone role\nif you see a text instead of this 👉 ${getEmoji(config.TEAserverID, 'TEA')} 👈 emoji.`, announcementsChannel.id, config.announcements.hookName)
                .then(() => logger('debug', `test.js:1 () An announcement test message sent in the '${announcementsChannel.name}' channel for the '${guild.name}' server.`))
                .catch(error => logger('warn', 'test.js:2 () Send to send test announcement', error.info));
            return botReply(`Announcement system test requested!\nType **${config.botPrefix}help announcements** if you don't see a new message in the ${announcementsChannel} channel for setup details.`, message);
        }
        default: return botReply('❌ Unknown system name, you can only test **overwatch** or **announcements** right now.', message);
    }
};