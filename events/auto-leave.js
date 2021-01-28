const { bot } = require("../teaBot");
const config = require('../bot-settings.json');
const cron = require('node-cron');
const { mysqlBotQuery } = require("../functions/mysqlBotTools");

bot.on('ready', () => { // https://crontab.guru/examples.html

    cron.schedule('0 0 * * *', () => {
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.info(`%c⧭ Auto leave non-TEA servers [daily] ${lastUpdate}`, 'color: #ff5252');
        autoLeaver();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function autoLeaver() {
        mysqlBotQuery(`SELECT guildDiscordID from ${config.mysql.cert_table_name} WHERE guildDiscordID IS NOT NULL`)
            .then(results => {
                if (!results[0]) return console.error(`auto-leave.js:1 autoLeaver() PROTECTION - Database is empty, that might be an error.`);

                for (const guild of bot.guilds.cache) {
                    const certifiedClub = results.find(record => record.guildDiscordID === guild[0]);

                    if (!certifiedClub) return guild[1].leave()
                        .then(g => console.info(`⭕ auto-leave.js:2 autoLeaver() Left the guild '${g}' due to not being a part of TEA.`))
                        .catch(error => console.error(`auto-leave.js:3 autoLeaver() error ${error}`));
                }
            })
            .catch(error => console.error(`auto-leave.js:4 autoLeaver() query error ${error}`));
    }
});