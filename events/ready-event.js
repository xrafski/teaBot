const { bot, BotVersion, errorLog } = require('../tea');
const config = require("../bot-settings.json");
bot.login(config.BotToken);

//////////////////////////////////////////////////////////////////////////////////////////////
//                                    READY EVENT HANDLER                                   //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', () => {
    console.info(`\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nTEA Bot (${bot.user.tag}) has logged in!\nVersion: ${BotVersion}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);

    // Set the bot user's presence
    bot.user.setPresence({ activity: { name: ' ', type: 'WATCHING' }, status: 'idle' })
        .then(() => {
            setInterval(() => {
                let amountOfPeople = 0;
                bot.guilds.cache.forEach(guild => amountOfPeople = amountOfPeople + guild.memberCount);
                bot.user.setPresence({ activity: { name: `${amountOfPeople} users 👮‍♂️`, type: 'WATCHING' }, status: 'online' });
            }, 3600000);
        }).catch(error => errorLog(`ready-event.js:1 ready Event()\nError to set the bot activity.`, error));
});