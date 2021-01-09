const { bot, TEAemoji, errorLog, botReply, embedMessage, Discord, TEAlogo, emojiCharacters } = require('../tea');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                                   TIP REACTION HANDLER                                   //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.channel.id === config.bugQueueChannelID || reaction.message.channel.id === config.bugGraphicalChannelID || reaction.message.channel.id === config.bugUIChannelID
        || reaction.message.channel.id === config.bugCombatChannelID || reaction.message.channel.id === config.bugBuildingChannelID || reaction.message.channel.id === config.bugCriticalChannelID
        || reaction.message.channel.id === config.bugMiscalculationChannelID || reaction.message.channel.id === config.bugInsufficientDataChannelID) {
        if (user.id === bot.user.id) return;

        return reaction.message.fetch()
            .then(() => {
                if (reaction.message.embeds[0] && reaction.message.embeds[0].author && reaction.message.embeds[0].author.name === 'Bug Report' && reaction.emoji.name === '✅') return emojiReactionMenu(reaction.message, user);
                else if (reaction.message.embeds[0] && reaction.message.embeds[0].author && reaction.message.embeds[0].author.name === 'Bug Report' && reaction.emoji.name === '💬' && !reaction.message.embeds[0].description) return confirmationMenu(reaction.message, user);
                // else if (reaction.message.embeds[0] && reaction.message.embeds[0].author && reaction.message.embeds[0].author.name === 'Bug Report' && reaction.message.embeds[0].description && reaction.emoji.name === '🐛') return autoReportReplyReset(reaction.message);
            }).catch(error => errorLog(`tip-reactions.js:1 messageReactionAdd event()\nError to fetch the message`, error));

        //////////////////////////////////////////////////////////////////////////////////////////////

        function emojiReactionMenu(message, reactUser) {

            const menuEmbed = new Discord.MessageEmbed()
                .setColor('#0095ff')
                .setAuthor('Reaction Menu', TEAlogo)
                .setDescription(`${user} You have reacted on this **[report message](${message.url})**.\nPlease react under this message to move to the appropriate category.\n\nLegend:\n❌ • Exit\n${emojiCharacters[1]} • <#${config.bugGraphicalChannelID}>\n${emojiCharacters[2]} • <#${config.bugUIChannelID}>\n${emojiCharacters[3]} • <#${config.bugCombatChannelID}>\n${emojiCharacters[4]} • <#${config.bugBuildingChannelID}>\n${emojiCharacters[5]} • <#${config.bugCriticalChannelID}>\n${emojiCharacters[6]} • <#${config.bugMiscalculationChannelID}>\n${emojiCharacters[7]} • <#${config.bugInsufficientDataChannelID}>`)
            return botReply(menuEmbed, message, 0, false)
                .then(async msg => {

                    if (msg) {
                        const emojiFilter = (reaction, user) => { // accept interaction only from the message author
                            return ['❌', emojiCharacters[1], emojiCharacters[2], emojiCharacters[3], emojiCharacters[4], emojiCharacters[5], emojiCharacters[6], emojiCharacters[7]].includes(reaction.emoji.name) && !user.bot && reactUser === user;
                        }

                        msg.awaitReactions(emojiFilter, { max: 1, time: 60000 })
                            .then(collected => {
                                const reaction = collected.first();
                                msg.delete().catch(() => { }); // Delete bot's msg

                                switch (reaction.emoji.name) {
                                    case '❌': return;
                                    case emojiCharacters[1]: return moveTheReport(config.bugGraphicalChannelID, 'graphical');
                                    case emojiCharacters[2]: return moveTheReport(config.bugUIChannelID, 'ui');
                                    case emojiCharacters[3]: return moveTheReport(config.bugCombatChannelID, 'combat');
                                    case emojiCharacters[4]: return moveTheReport(config.bugBuildingChannelID, 'building');
                                    case emojiCharacters[5]: return moveTheReport(config.bugCriticalChannelID, 'critical');
                                    case emojiCharacters[6]: return moveTheReport(config.bugMiscalculationChannelID, 'miscalculations');
                                    case emojiCharacters[7]: return moveTheReport(config.bugInsufficientDataChannelID, 'insufficient_data');
                                    default: return;
                                }
                            })
                            .catch(error => {
                                msg.delete().catch(() => { });
                                if (error.message === "Cannot read property 'emoji' of undefined") return botReply(embedMessage(`${user} ❌ There was no reaction within the time limit (1min)!`), message, 10000, true);
                                errorLog(`tip-reactions.js:1 emojiReactionMenu()\nError when user answer the msg.`, error);
                            });

                        await msg.react(emojiCharacters[1]);
                        await msg.react(emojiCharacters[2]);
                        await msg.react(emojiCharacters[3]);
                        await msg.react(emojiCharacters[4]);
                        await msg.react(emojiCharacters[5]);
                        await msg.react(emojiCharacters[6]);
                        await msg.react(emojiCharacters[7]);
                        await msg.react('❌');
                    }
                })
                .catch(error => {
                    if (error.message === 'Unknown Message') return;
                    errorLog(`tip-reactions.js:2 emojiReactionMenu() Error in the function - probably missing permissions (READ_MESSAGES/READ_MESSAGE_HISTORY/ADD_REACTIONS)`, error)
                })
        }

        function moveTheReport(channelID, type) {
            const BUGchannel = bot.guilds.cache.get(config.HidenBugServerID).channels.cache.get(channelID);

            if (BUGchannel) {
                if (reaction.message.channel === BUGchannel) return botReply(embedMessage(`${user} ${TEAemoji()} You can't move the report because it's already here!`), reaction.message, 10000, true);
                else return BUGchannel.send(reaction.message.embeds[0]).catch(() => { botReply(embedMessage(`${user} ${TEAemoji()} Error to move the report, try again later...`), reaction.message, 10000, true) })
                    .then(async message => {
                        if (message) {
                            reaction.message.delete().catch(() => { });
                            botReply(embedMessage(`${user} ${TEAemoji()} [Report](${message.url}) has been moved to ${BUGchannel}!`), reaction.message, 10000, true);
                        }
                        else return;
                    })
                    .catch(error => { errorLog(`tip-reactions.js:1 moveTheReport() Error in the function - probably missing permissions (READ_MESSAGES/READ_MESSAGE_HISTORY/ADD_REACTIONS)`, error); })

            } else {
                botReply(embedMessage(`${user} ${TEAemoji()} Error to move report, try again later...`), reaction.message, 10000, true);
                errorLog(`tip-reactions.js:2 moveTheReport() ${type} channel is missing read permissions or maybe wrong channel ID in conf file.`);
            }
        }

        function autoReportReplyReset(message) {
            const embedContent = message.embeds[0];
            const replyConfirmation = new Discord.MessageEmbed(embedContent).setDescription('');
            message.edit(replyConfirmation)
        }

        function confirmationMenu(message, reactUser) {
            const confirmationEmbed = new Discord.MessageEmbed()
                .setColor('#0095ff')
                .setAuthor('Auto-Reply Confirmation', TEAlogo)
                .setDescription(`${user}, Please confirm to send an auto-reply to the author of this [report](${message.url}).`)
            return botReply(confirmationEmbed, message, 0, false)
                .then(async msg => {

                    if (msg) {
                        const emojiFilter = (reaction, user) => { // accept interaction only from the message author
                            return ['❌', '✅'].includes(reaction.emoji.name) && !user.bot && reactUser === user;
                        }

                        msg.awaitReactions(emojiFilter, { max: 1, time: 60000 })
                            .then(collected => {
                                const reaction = collected.first();
                                msg.delete().catch(() => { }); // Delete bot's msg

                                switch (reaction.emoji.name) {
                                    case '❌': return;
                                    case '✅': return autoReportReply(message);
                                    default: return;
                                }
                            })
                            .catch(error => {
                                msg.delete().catch(() => { });
                                if (error.message === "Cannot read property 'emoji' of undefined") return botReply(embedMessage(`${user} ❌ There was no reaction within the time limit (1min)!`), message, 10000, true);
                                errorLog(`tip-reactions.js:1 confirmationMenu()\nError when user answer the msg.`, error);
                            });

                        await msg.react('✅');
                        await msg.react('❌');
                    }
                })
                .catch(error => {
                    if (error.message === 'Unknown Message') return;
                    errorLog(`tip-reactions.js:2 confirmationMenu() Error in the function - probably missing permissions (READ_MESSAGES/READ_MESSAGE_HISTORY/ADD_REACTIONS)`, error)
                })
        }

        function autoReportReply(message) {
            const embedContent = message.embeds[0];
            const requesterID = message.embeds[0].title.split(' ').slice(-1).toString().replace(/\D/g, '');
            // console.debug(requesterID);

            bot.users.fetch(requesterID)
                .then(requester => {
                    // console.debug(requester);
                    requester.send(embedMessage(`Unfortunately, ${TEAemoji()} **TEA** is unable to utilize this information.\nPlease contact customer support [here](https://support.gamigo.com/hc/en-us "gamigo Group Support Center").`))
                        .then(messageSent => {
                            if (messageSent) {
                                const replyConfirmation = new Discord.MessageEmbed(embedContent).setDescription(`💬 Auto-Reply has been sent`);
                                message.edit(replyConfirmation).catch(error => console.debug(`Error to edit the report message #1`, error));
                            } else console.debug(`messageSent is undefined aka DM is not sent - ${message.url}`);
                        })
                        .catch(error => {
                            // console.debug(`Error to send a direct message`, error);
                            const errorReply = new Discord.MessageEmbed(embedContent).setDescription(`💬 Auto-Reply has failed successfully!\n❌ ${error.message}`);
                            message.edit(errorReply).catch(error => console.debug(`Error to edit the report message #2`, error));
                        });
                })
                .catch(error => {
                    // console.debug(`Error to fetch the user`, error);
                    const errorReply = new Discord.MessageEmbed(embedContent).setDescription(`💬 Auto-Reply has failed successfully!\n❌ ${error.message}`);
                    message.edit(errorReply).catch(error => console.debug(`Error to edit the report message #3`, error));
                });
        }

    } else return;
});