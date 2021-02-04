const { bot } = require('../teaBot');
const config = require('../bot-settings.json');
// const cron = require('node-cron');
const { mysqlQueryBot } = require("../functions/mysqlBotTools");
const { logger } = require('../functions/logger');

bot.on('ready', () => { // https://crontab.guru/examples.html
    // cron.schedule('0 8 * * *', () => { checkGuidelines() }); // run guidelines update function daily at 8AM CEST
});

function checkGuidelines() {
    logger('update', `Guidelines Update [Daily]`, null, 'white');
    const primaryGuildChannel = bot.guilds.cache.get(config.TEAserverID)?.channels.cache.find(ch => ch.name === config.guidelines.channelName);
    if (primaryGuildChannel) {
        if (primaryGuildChannel.permissionsFor(primaryGuildChannel.guild.me).has('READ_MESSAGE_HISTORY')) {
            primaryGuildChannel.messages.fetch({ limit: 1 })
                .then(msgs => {
                    const guidelinesMessage = msgs.filter(message => message.author === bot.user && message.embeds[0]).first(); // guidelinesMessage has to be sent by the bot and need to have an embed.
                    if (!guidelinesMessage) return logger('error', `update-guidelines.js:1 checkGuidelines() #${primaryGuildChannel.name} doesn't have a message to copy data from`);
                    else {
                        const messageObject = {
                            content: (guidelinesMessage.content ? guidelinesMessage.content : ''),
                            embed: guidelinesMessage.embeds[0]
                        }
                        if (guidelinesMessage.content) return updateGuidelines(messageObject);
                        else return updateGuidelines(messageObject);
                    }
                })
                .catch(error => logger('error', `update-guidelines.js:2 checkGuidelines() Fetch the message`, error));
        } else return logger('error', `update-guidelines.js:3 checkGuidelines() Missing READ_MESSAGE_HISTORY for the #${primaryGuildChannel.name} in '${primaryGuildChannel.guild.name}' server`);
    } else return logger('error', `update-guidelines.js:4 checkGuidelines() Incorrect TEAserverID or there is no channel called '${config.guidelines.channelName}'`);
};

function updateGuidelines(guidelinesMessage) {
    mysqlQueryBot(`SELECT guildDiscordID from ${config.mysql.cert_table_name} WHERE guildDiscordID IS NOT NULL`)
        .then(results => {
            if (!results[0]) return logger('warn', `update-guidelines.js:1 autoLeaver() PROTECTION - Database is empty, that might be an error`);

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
                                                .then(() => logger('log', `update-guidelines.js:1 updateGuidelines() Guidelines message has been updated in '${guild.name}' server`))
                                                .catch(error => logger('error', `update-guidelines.js:2 updateGuidelines() Edit the message in '${guild.name}' server`, error));
                                        } else return logger('debug', `update-guidelines.js:3 updateGuidelines() No need to update, latest guidelines message detected in '${guild.name}' server`);
                                    } else { // send a new message if not found old one.
                                        return guidelinesChannel.send(guidelinesMessage)
                                            .then(() => logger('log', `update-guidelines.js:4 updateGuidelines() Sent a new guidelines message into '${guidelinesChannel.name}' in '${guild.name}' server`))
                                            .catch(error => logger('error', `update-guidelines.js:5 updateGuidelines() Send the message in '${guild.name}'`, error));
                                    }
                                })
                                .catch(error => logger('error', `update-guidelines.js:6 updateGuidelines() ${guidelinesChannel.name} in '${guild.name}' server`, error));
                        } else return logger('error', `update-guidelines.js:7 updateGuidelines() Missing READ_MESSAGE_HISTORY for the #${guidelinesChannel.name} in '${guild.name}' server`);
                    } else return logger('error', `update-guidelines.js:8 updateGuidelines() There is no '${config.guidelines.channelName}' channel in '${guild.name}' server`);
                } else {
                    guild.channels.cache.find(ch => ch.name === config.guidelines.channelName).messages.fetch({ limit: 1 })
                        .then(msgs => {
                            const gMessage = msgs.filter(message => message.author === bot.user && message.embeds[0]).first(); // gMessage has to be sent by the bot and need to have an embed.
                            if (gMessage) return gMessage.delete()
                                .then(() => logger('log', `update-guidelines.js:9 updateGuidelines() Removed guidelines messages in non-TEA server in '${guild.name}' server`))
                                .catch(error => logger('error', `update-guidelines.js:10 updateGuidelines() Delete message in non-TEA server in '${guild.name}' server`, error))
                        })
                        .catch(error => logger('error', `update-guidelines.js:11 updateGuidelines() Fetch guidelines channel messages in '${guild.name}' server`, error));
                }
            });
        })
        .catch(error => logger('error', `update-guidelines.js:9 updateGuidelines() mysqlBotQuery`, error));
};

module.exports.updGuidelines = checkGuidelines;