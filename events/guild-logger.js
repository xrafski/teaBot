
const { bot, logger, getEmoji } = require('../teaBot');
const config = require('../bot-settings.json');

bot.on('guildCreate', guild => {
    logger('info', `guild-logger.js:2 () ${bot.user.username} just joined '${guild.name}' server.`);
    guild.systemChannel?.send(`Hello, I'm Trove Ethics Alliance Bot ${getEmoji(config.botDetails.TEAserverID, 'TEA')}.\nThanks for inviting me, type **${config.botDetails.prefix}help** to check out my commands!\nIf you need any further information or want to report bugs, please do not hesitate to contact the bot owner\n(Discord: **${config.botDetails.owner.tag}** | Trove: **RNG**).`)
        .catch(err => logger('error', `guild-logger.js:1 () Error to send 'bot-join-message' message.`, err));
});

bot.on('guildDelete', async guild => {
    logger('info', `guild-logger.js:3 () ${bot.user.username} just left '${guild.name}' server.`);
});