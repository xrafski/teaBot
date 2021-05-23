const { bot, logger, getEmoji } = require("../teaBot");
const config = require('../bot-settings.json');

bot.on('message', async message => {
    const { embeds, channel } = message;
    if (channel.id != config.channels.requestChannelID) return; // block the notification function outside request channel.

    const notifChannel = bot.channels.cache.get(config.channels.notificationChannelID);
    if (!notifChannel) return logger('error', `notifications.js:1 Notification channel is not found.`);

    switch (embeds[0]?.footer?.text) {
        // apply command notifications
        case 'TEA Registry Request': return notifChannel.send(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} Club **${embeds[0].fields[0].value}** has sent a registry request for the alliance!\n${message.url}\n<@&${config.roles.registryNotifRoleID}>`)
            .catch(err => logger('warn', `notifications.js:2 Send notification message.`, err));

        // clearance command notifications
        case 'TEA Clearance Request': return notifChannel.send(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} ${embeds[0].fields[3].value.split(' • ')[0]} has sent a clearance request for the **${embeds[0].fields[1].value}** club!\n${message.url}\n<@&${config.roles.clearanceNotifRoleID}>`)
            .catch(err => logger('warn', `notifications.js:2 Send notification message.`, err));

        default: return;
    }
});