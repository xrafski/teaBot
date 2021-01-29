const { bot } = require('../teaBot');
const config = require('../bot-settings.json');
const cron = require('node-cron');
const { mysqlBotQuery } = require("../functions/mysqlBotTools");

bot.on('ready', () => { // https://crontab.guru/examples.html
    cron.schedule('0 8 * * *', () => { // run guidelines update function daily at 8AM CEST
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.info(`%c⧭ Guidelines Update [Daily] ${lastUpdate}`, 'color: #ff42ec',);
        checkGuidelines();
    });
});

function checkGuidelines() {
    const primaryGuildChannel = bot.guilds.cache.get(config.TEAserverID)?.channels.cache.find(ch => ch.name === config.guidelines.channelName);
    if (primaryGuildChannel) {
        if (primaryGuildChannel.permissionsFor(primaryGuildChannel.guild.me).has('READ_MESSAGE_HISTORY')) {
            primaryGuildChannel.messages.fetch({ limit: 1 })
                .then(msgs => {
                    const guidelinesMessage = msgs.filter(message => message.author === bot.user && message.embeds[0]).first(); // guidelinesMessage has to be sent by the bot and need to have an embed.
                    if (!guidelinesMessage) return console.error(`update-guidelines.js:1 checkGuidelines() #${primaryGuildChannel.name} doesn't have a message to copy data from.`);
                    else {
                        const messageObject = {
                            content: (guidelinesMessage.content ? guidelinesMessage.content : ''),
                            embed: guidelinesMessage.embeds[0]
                        }
                        if (guidelinesMessage.content) return updateGuidelines(messageObject);
                        else return updateGuidelines(messageObject);
                    }
                })
                .catch(error => console.error(`update-guidelines.js:2 checkGuidelines() ${error}`));
        } else return console.error(`update-guidelines.js:3 checkGuidelines() Missing READ_MESSAGE_HISTORY for the #${primaryGuildChannel.name} in '${primaryGuildChannel.guild.name}' server.`);
    } else return console.error(`update-guidelines.js:4 checkGuidelines() Incorrect TEAserverID or there is no channel called '${config.guidelines.channelName}'.`);
};

function updateGuidelines(guidelinesMessage) {
    mysqlBotQuery(`SELECT guildDiscordID from ${config.mysql.cert_table_name} WHERE guildDiscordID IS NOT NULL`)
        .then(results => {
            if (!results[0]) return console.error(`update-guidelines.js:1 autoLeaver() PROTECTION - Database is empty, that might be an error.`);

            bot.guilds.cache.forEach(guild => {
                const certifiedClub = results.find(record => record.guildDiscordID === guild.id);
                if (certifiedClub) {
                    if (guild.id === config.TEAserverID) return; // ignore if primary server is found
                    const guidelinesChannel = guild.channels.cache.find(ch => ch.name === config.guidelines.channelName);
                    if (guidelinesChannel) {
                        if (guidelinesChannel.permissionsFor(guidelinesChannel.guild.me).has('READ_MESSAGE_HISTORY')) {
                            guidelinesChannel.messages.fetch({ limit: 1 })
                                .then(msgs => {
                                    const gMessage = msgs.filter(message => message.author === bot.user && message.embeds[0]).first(); // gMessage has to be sent by the bot and need to have an embed.
                                    if (gMessage) { // message found - update it if needed
                                        if (gMessage.embeds[0].footer.text != guidelinesMessage.embed.footer.text) { // update the message if footer text doesn't match
                                            return gMessage.edit(guidelinesMessage)
                                                .then(() => console.debug(`update-guidelines.js:1 updateGuidelines(${guild.name}) Guidelines message has been updated.`))
                                                .catch(error => console.error(`update-guidelines.js:2 updateGuidelines(${guild.name}) Error to modify the message ${error}`));
                                        } else return; console.log(`update-guidelines.js:3 updateGuidelines(${guild.name}) No need to update, latest guidelines message detected.`);
                                    } else { // send a new message if not found old one.
                                        return guidelinesChannel.send(guidelinesMessage)
                                            .then(() => console.info(`update-guidelines.js:4 updateGuidelines(${guild.name}) Sent a new guidelines message into '${guidelinesChannel.name}'.`))
                                            .catch(error => console.error(`update-guidelines.js:5 updateGuidelines(${guild.name}) Error to send guidelines ${error}`));
                                    }
                                })
                                .catch(error => console.error(`update-guidelines.js:6 updateGuidelines(🔴) ${error} for the ${guidelinesChannel.name} in '${guild.name}'`));
                        } else return console.error(`update-guidelines.js:7 updateGuidelines(⭕) Missing READ_MESSAGE_HISTORY for the #${guidelinesChannel.name} in '${guild.name}'.`);
                    } else return console.error(`update-guidelines.js:8 updateGuidelines(❌) There is no '${config.guidelines.channelName}' channel in '${guild.name}'.`);
                } else {
                    guild.channels.cache.find(ch => ch.name === config.guidelines.channelName).messages.fetch({ limit: 1 })
                        .then(msgs => {
                            const gMessage = msgs.filter(message => message.author === bot.user && message.embeds[0]).first(); // gMessage has to be sent by the bot and need to have an embed.
                            if (gMessage) return gMessage.delete()
                                .then(() => console.info(`update-guidelines.js:9 updateGuidelines (${guild.name}) Removed guidelines messages in non-TEA server.`))
                                .catch(error => console.error(`update-guidelines.js:10 updateGuidelines (${guild.name}) Delete error in non-TEA server guidelines ${error}`))
                        })
                        .catch(error => console.error(`update-guidelines.js:11 updateGuidelines (${guild.name}) Error to fetch guidelines channel messages ${error}`));
                }
            });
        })
        .catch(error => console.error(`update-guidelines.js:9 updateGuidelines() database error ${error}`));
};

module.exports.updGuidelines = checkGuidelines;