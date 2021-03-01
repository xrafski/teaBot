const { bot, BotVersion, logger } = require('../teaBot');
const { loadPrefixes } = require('../cache/guild-prefixes');
const { loadCodes, loadEventStatus } = require('../cache/tea-events');

bot.on('ready', async () => {
    logger('update', `ready-event.js:1 () Trove Ethics Alliance Bot v${BotVersion} (${bot.user.tag}) has logged in!`, `New version: ${BotVersion}`);

    await loadPrefixes(bot, (err, res) => { // module to load guild's prefixes
        if (err) return logger('error', `ready-event.js:2 () Error to load prefixes`, err);
        logger('info', `ready-event.js:3 () ${res.message}`);
    });

    await loadCodes((err, res) => { // module to load event codes
        if (err) return logger('error', `ready-event.js:4 () Error to load codes`, err);
        logger('info', `ready-event.js:5 () ${res.message}`);
    });

    await loadEventStatus((err, res) => { // module to load event status
        if (err) return logger('error', `ready-event.js:6 () Error to load event status`, err);
        logger('info', `ready-event.js:7 () ${res.message}`);
    });

    bot.user.setPresence({ activity: { name: ' ', type: 'WATCHING' }, status: 'idle' })
        .then(() => {
            setInterval(() => {
                let memberCount = 0;
                for (const guild of bot.guilds.cache) memberCount = memberCount + guild[1].memberCount;
                bot.user.setPresence({ activity: { name: `${memberCount} users 👮‍♂️`, type: 'WATCHING' }, status: 'online' });
            }, 3600000);
        })
        .catch(error => logger('error', `ready-event.js:8 () Error to set the bot activity status.`, error));
});