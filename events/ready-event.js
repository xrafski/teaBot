const { bot, BotVersion, logger } = require('../teaBot');
const { botToken } = require('../bot-settings.json');
const { loadPrefixes } = require('../cache/guild-prefixes');
bot.login(botToken);

bot.on('ready', () => {
    logger('update', `ready-event.js:1 () Trove Ethics Alliance Bot v${BotVersion} (${bot.user.tag}) has logged in!`, `New version: ${BotVersion}`);

    loadPrefixes(bot)
        .then(res => logger('info', `ready-event.js:2 () 'guildPrefixesCache Object' has loaded '${res.length}' prefixes from the database.`))
        .catch(err => logger('error', `ready-event.js:3 () Error to load prefixes`, err));

    bot.user.setPresence({ activity: { name: ' ', type: 'WATCHING' }, status: 'idle' })
        .then(() => {
            setInterval(() => {
                let memberCount = 0;
                for (const guild of bot.guilds.cache) memberCount = memberCount + guild[1].memberCount;
                bot.user.setPresence({ activity: { name: `${memberCount} users 👮‍♂️`, type: 'WATCHING' }, status: 'online' });
            }, 3600000);
        })
        .catch(error => logger('error', `ready-event.js:4 () Error to set the bot activity status.`, error));
});