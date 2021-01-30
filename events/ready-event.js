const { bot, BotVersion } = require('../teaBot');
const config = require("../bot-settings.json");
const { logger } = require('../functions/logger');
bot.login(config.botToken);

bot.on('ready', () => {
    logger('info', `\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nTrove Ethics Alliance Bot (${bot.user.tag}) has logged in!\nVersion: ${BotVersion}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);

    // Set the bot user's presence
    bot.user.setPresence({ activity: { name: ' ', type: 'WATCHING' }, status: 'idle' })
        .then(() => {
            setInterval(() => {
                let amountOfPeople = 0;
                bot.guilds.cache.forEach(guild => amountOfPeople = amountOfPeople + guild.memberCount);
                bot.user.setPresence({ activity: { name: `${amountOfPeople} users 👮‍♂️`, type: 'WATCHING' }, status: 'online' });
            }, 3600000);
        }).catch(error => logger('warn',`ready-event.js:1 () Set the bot activity`, error));
});