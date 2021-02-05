const { bot } = require('../teaBot');
const { logger } = require('../functions/logger');

bot.on('guildCreate', guild => { 
    logger('info', `join-guild.js:1 | ${bot.user.username} just joined '${guild.name}' server.`, null, 'green');
});

bot.on('guildDelete', guild => {
    logger('info', `join-guild.js:2 | ${bot.user.username} just left '${guild.name}' server.`, null, 'red');
});