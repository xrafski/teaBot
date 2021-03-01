const { removePrefix } = require('../cache/guild-prefixes');
const { bot, logger, getEmoji } = require('../teaBot');
const { botPrefix, ownerTag, TEAserverID } = require('../bot-settings.json');

bot.on('guildCreate', guild => {
    guild?.systemChannel.send(`Hello, I'm Trove Ethics Alliance Bot ${getEmoji(TEAserverID, 'TEA')}.\nThanks for inviting me, type **${botPrefix}help** to check out my commands!\nIf you need any further information or want to report bugs, please do not hesitate to contact the bot owner (Discord: **${ownerTag}** | Trove: **RNG**).`)
        .catch(err => logger('error', `guild-logger.js:1 () Error to send 'bot-join-message' message.`, err));
    logger('info', `guild-logger.js:2 () ${bot.user.username} just joined '${guild.name}' server.`);
});

bot.on('guildDelete', async guild => {
    logger('info', `guild-logger.js:3 () ${bot.user.username} just left '${guild.name}' server.`);
    await removePrefix(guild)
        .then(res => logger('log', `guild-logger.js:4 () '${guild.name}' ${res.message}`))
        .catch(err => logger('error', `guild-logger.js:5 () Error to remove prefix for the '${guild.name}' guild in the 'prefixes' collection.`, err));
});