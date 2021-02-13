const { sendEmbedLog, botReply, logger } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = {
    name: "announcement",
    description: "Send a global announcement to all TEA members",
    type: "administrator",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message, args) => {
    if (!args[0]) return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    // const mainAnnouncementChannel = message.guild.channels.cache.get(config.announcements.channelName);
    // if (!mainAnnouncementChannel) return botReply(`No **#${config.announcements.channelName}** channel on this server!`, message);
    // if (message.channel != mainAnnouncementChannel) return botReply(`You can use this command **only** in the ${mainAnnouncementChannel}!`, message);

    for (const guild of bot.guilds.cache) {
        const announcementChannel = guild[1].channels.cache.find(channel => channel.name === config.announcements.channelName);
        if (announcementChannel) {
            await sendEmbedLog(args.join(' '), announcementChannel.id, config.announcements.hookName)
                .then(() => logger('debug', `announcement.js:1 () message sent in the '${guild[1].name}' server.`))
                .catch(error => logger('warn', `announcement.js:2 () Send announcement message in the '${guild[1].name}' server.`, error.info));
        } else logger('warn', `announcement.js:3 () Announcement channel is not detected for the '${guild[1].name}' server.`);
    }
}