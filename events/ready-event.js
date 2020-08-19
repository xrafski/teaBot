const { bot, BotVersion, errorLog } = require('../tea');
const config = require("../bot-settings.json");
bot.login(config.BotToken);

//////////////////////////////////////////////////////////////////////////////////////////////
//                                    READY EVENT HANDLER                                   //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', () => {
    console.info(`\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nTEA Bot (${bot.user.tag}) has logged in!\nVersion: ${BotVersion}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);

    bot.guilds.cache.forEach(guild => {
        guild.members.fetch().catch(error => { errorLog(`ready-event.js:1 ready Event() Error to cache members of '${guild.name}'.`, error) })
    });

    // Set the bot user's presence
    bot.user.setPresence({ activity: { name: ' ', type: 'WATCHING' }, status: 'idle' })
        .then(() => {
            setInterval(() => {
                bot.user.setPresence({ activity: { name: `${bot.users.cache.size} users 👮‍♂️`, type: 'WATCHING' }, status: 'online' })
            }, 1800000);
        }).catch(error => errorLog(`ready-event.js:2 ready Event()\nError to set the bot activity.`, error));
});