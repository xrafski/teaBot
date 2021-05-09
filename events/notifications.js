const { bot, logger, getEmoji } = require("../teaBot");
const { notificationPings, TEAserverID } = require('../bot-settings.json');

bot.on('message', async message => {
    const { author, embeds, channel } = message;
    if (channel.id === notificationPings.registryChannelID && author.bot && embeds[0]?.footer.text === 'TEA Registry Request') {
        const notifChannel = bot.channels.cache.get(notificationPings.notificationChannelID);
        if (!notifChannel) return logger('warn', `notifications.js:1 Notification channel is not found.`);

        notifChannel.send(`${getEmoji(TEAserverID, 'TEA')} <@&${notificationPings.registryNotifRoleID}>\nClub **${embeds[0].fields[0].value}** by ${embeds[0].fields[6].value}\n${message.url}`)
            .catch(err => logger('warn', `notifications.js:2 Send notification message.`, err));
    } else return;
});