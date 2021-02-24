const { removePrefix } = require('../cache/guild-prefixes');
const { bot, logger } = require('../teaBot');

bot.on('guildCreate', guild => {
    logger('info', `guild-logger:1 () ${bot.user.username} just joined '${guild.name}' server.`);
});

bot.on('guildDelete', async guild => {
    logger('info', `guild-logger:2 () ${bot.user.username} just left '${guild.name}' server.`);
    await removePrefix(guild)
        .then(res => logger('log', `guild-logger:3 () '${guild.name}' ${res.message}`))
        .catch(err => logger('error', `guild-logger:4 () Error to remove prefix for the '${guild.name}' guild in the 'prefixes' collection.`, err));
});