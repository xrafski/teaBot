const { bot, logger } = require('../teaBot');

bot.on('guildCreate', guild => {
    logger('info', `guild-logger:1 () ${bot.user.username} just joined '${guild.name}' server.`);
});

bot.on('guildDelete', guild => {
    logger('info', `guild-logger:2 () ${bot.user.username} just left '${guild.name}' server.`);
});