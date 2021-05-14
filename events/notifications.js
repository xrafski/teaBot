const { bot, logger, getEmoji } = require("../teaBot");
const { notificationPings, TEAserverID } = require('../bot-settings.json');

bot.on('message', async message => {
    const { author, embeds, channel } = message;
    if (channel.id === notificationPings.registryChannelID && author.bot || channel.id === notificationPings.clearanceChannelID && author.bot) {
        const notifChannel = bot.channels.cache.get(notificationPings.notificationChannelID);
        if (!notifChannel) return logger('error', `notifications.js:1 Notification channel is not found.`);

        switch (embeds[0]?.footer.text) {
            // apply command notifications
            case 'TEA Registry Request': return notifChannel.send(`${getEmoji(TEAserverID, 'TEA')} Club **${embeds[0].fields[0].value}** has sent a registry request for the alliance!\n${message.url}\n<@&${notificationPings.registryNotifRoleID}>`)
                .catch(err => logger('warn', `notifications.js:2 Send notification message.`, err));

            // clearance command notifications
            case 'TEA Clearance Request': return notifChannel.send(`${getEmoji(TEAserverID, 'TEA')} User ${embeds[0].fields[3].value.split(' • ')[0]} has sent a clearance request for the **${embeds[0].fields[1].value}** club!\n${message.url}\n<@&${notificationPings.registryNotifRoleID}>`)
                .catch(err => logger('warn', `notifications.js:2 Send notification message.`, err));

            default: return;
        }
    } else return;
});