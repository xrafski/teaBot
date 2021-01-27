const { bot } = require("../teaBot");
const config = require('../bot-settings.json');
const cron = require('node-cron');
const { mysqlBotQuery } = require("../functions/mysqlBotTools");

bot.on('ready', () => { // https://crontab.guru/examples.html

    cron.schedule('0 0 * * *', () => {
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Auto leave non-TEA servers [daily] ${lastUpdate}`, 'color: #ff5252');
        autoLeaver();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function autoLeaver() {
        mysqlBotQuery(`SELECT * FROM ${config.mysql.cert_table_name}`)
            .then(results => {
                if (results.length <= 20) return console.error(`auto-leave.js:1 autoLeaver() Protection against leaving servers when database is empty.`);

                const discordIDlist = [];
                results.forEach(element => {
                    if (!element.guildDiscordID) return;
                    discordIDlist.push(element.guildDiscordID);
                });

                for (const element of bot.guilds.cache) {
                    // console.info(`🟢 ${element[1].name} is ${discordIDlist.includes(element[0])} as TEA Member`);

                    if (!discordIDlist.includes(element[0])) {
                        const guild = bot.guilds.cache.get(element[0])
                        if (guild) {
                            return guild.leave()
                                .then(g => console.info(`⭕ auto-leave.js:2 autoLeaver() Left the guild '${g}' due to not being a part of TEA.`))
                                .catch(error => console.error(`auto-leave.js:3 autoLeaver() Leave guild error ${error}`));
                        } else return console.error(`auto-leave.js:4 autoLeaver() guild is not found for some unknown reason.`);
                    }
                }
            })
            .catch(error => console.error(`auto-leave.js:5 autoLeaver() ${error}`));
    }
});