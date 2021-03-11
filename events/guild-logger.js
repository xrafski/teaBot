
const { bot, logger, getEmoji } = require('../teaBot');
const { botPrefix, ownerTag, TEAserverID } = require('../bot-settings.json');

bot.on('guildCreate', guild => {
    logger('info', `guild-logger.js:2 () ${bot.user.username} just joined '${guild.name}' server.`);
    guild.systemChannel?.send(`Hello, I'm Trove Ethics Alliance Bot ${getEmoji(TEAserverID, 'TEA')}.\nThanks for inviting me, type **${botPrefix}help** to check out my commands!\nIf you need any further information or want to report bugs, please do not hesitate to contact the bot owner (Discord: **${ownerTag}** | Trove: **RNG**).`)
        .catch(err => logger('error', `guild-logger.js:1 () Error to send 'bot-join-message' message.`, err));
});

bot.on('guildDelete', async guild => {
    logger('info', `guild-logger.js:3 () ${bot.user.username} just left '${guild.name}' server.`);
});