const { bot } = require("../teaBot");
const config = require('../bot-settings.json');
const cron = require('node-cron');
const { mysqlBotQuery } = require("../functions/mysqlBotTools");
const { logger } = require("../functions/logger");

bot.on('ready', () => { // https://crontab.guru/examples.html

    cron.schedule('0 0 * * *', () => {
        logger('update', `Auto leave non-TEA servers [Daily]`, null, 'white');
        autoLeaver();
    });

    function autoLeaver() {
        mysqlBotQuery(`SELECT guildDiscordID from ${config.mysql.cert_table_name} WHERE guildDiscordID IS NOT NULL`)
            .then(results => {
                if (!results[0]) return logger('warn', `auto-leave.js:1 autoLeaver() PROTECTION - Database is empty, that might be an error.`);

                for (const guild of bot.guilds.cache) {
                    const certifiedClub = results.find(record => record.guildDiscordID === guild[0]);

                    if (!certifiedClub) return guild[1].leave()
                        .then(g => logger('info', `auto-leave.js:2 autoLeaver() Left the '${g}' guild due to not being a part of TEA.`))
                        .catch(error => logger('error', `auto-leave.js:3 autoLeaver() Leave the guild`, error));
                }
            })
            .catch(error => logger('error', `auto-leave.js:4 autoLeaver() mysqlBotQuery`, error));
    }
});