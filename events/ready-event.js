const { bot, BotVersion, logger } = require('../teaBot');
const config = require("../bot-settings.json");
bot.login(config.botToken);

bot.on('ready', () => {
    logger('info', `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Trove Ethics Alliance Bot (${bot.user.tag}) has logged in! Version: ${BotVersion} ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);

    bot.user.setPresence({ activity: { name: ' ', type: 'WATCHING' }, status: 'idle' })
        .then(() => {
            setInterval(() => {
                let memberCount = 0;
                for (const guild of bot.guilds.cache) memberCount = memberCount + guild[1].memberCount;
                bot.user.setPresence({ activity: { name: `${memberCount} users 👮‍♂️`, type: 'WATCHING' }, status: 'online' });
            }, 3600000);
        })
        .catch(error => logger('error', `ready-event.js:1 () Set the bot activity`, error));
});