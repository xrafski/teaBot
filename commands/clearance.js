const { botReply, logger, getEmoji, Discord, TEAlogo } = require("../teaBot");
const config = require('../bot-settings.json');
const fs = require('fs');

module.exports.help = {
    name: "clearance",
    description: "Request access to the TEA discord server",
    type: "public",
    usage: `ℹ️ Format: **${config.botDetails.prefix}clearance**`
};

module.exports.run = async (bot, message) => {
    let clubNameVar;
    let nicknameVar;
    let clubRoleVar;
    let reasonVar;
    let requesterVar;

    const questionResponseTime = 600000; // 10 mins
    const filter = m => m.author.id === message.author.id; // await message filter
    const { guild, author } = message;

    if (guild.id != config.botDetails.TEAserverID) return botReply(`This command is only available on the primary TEA discord server.`, message);
    else ClubNameQ(); // run the question chain


    function ClubNameQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`Please enter club name.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'clearance.js:1 ClubNameQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`❌ Cancelled`, message);
                        else if (answerContent.length < 3) return ClubNameQ('❌ Club name is too short [3 characters].');
                        else if (answerContent.length > 20) return ClubNameQ('❌ Club name is too long [20 characters].');
                        else {
                            requesterVar = message.author;
                            clubNameVar = answerContent;
                            return checkClubName(answerContent);
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'clearance.js:2 ClubNameQ() Answer error', error);
                    });
            });


        function checkClubName(clubName) {
            return fs.readFile('./cache/certification.json', 'utf8', (error, data) => {
                if (error) {
                    logger('error', 'clearance.js:1 () Load certification.json file', error);
                    return botReply('❌ Error to parse the data, try again later.', message);
                }
                if (JSON.parse(data).find(club => club.guildName?.toLowerCase() === clubName.toLowerCase())) return NicknameQ();
                else return botReply(`Not found. This club is either not registered or typed incorrectly!`, message)
            });
        }
    }

    function NicknameQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`What's your in-game name?\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'clearance.js:1 NicknameQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`❌ Cancelled`, message);
                        else if (answerContent.length < 3) return NicknameQ('❌ Nickname is too short [3 characters].');
                        else if (answerContent.length > 20) return NicknameQ('❌ Nickname too long [20 characters].');
                        else {
                            nicknameVar = answerContent;
                            return ClubRoleQ();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'clearance.js:2 NicknameQ() Answer error', error);
                    });
            });
    }

    function ClubRoleQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`What's your role in ${clubNameVar ? clubNameVar : 'unknown'}?\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'clearance.js:1 ClubRoleQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`❌ Cancelled`, message);
                        else if (answerContent.length < 1) return ClubRoleQ('❌ Asnwer is too short [1 character].');
                        else if (answerContent.length > 30) return ClubRoleQ('❌ Answer too long [30 characters].');
                        else {
                            clubRoleVar = answerContent;
                            return ReasonQ();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'clearance.js:2 ClubRoleQ() Answer error', error);
                    });
            });
    }

    function ReasonQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`Reason for joining?\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'clearance.js:1 ReasonQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`❌ Cancelled`, message);
                        else if (answerContent.length < 3) return ReasonQ('❌ Asnwer is too short [3 characters].');
                        else if (answerContent.length > 300) return ReasonQ('❌ Answer too long [300 characters].');
                        else {
                            reasonVar = answerContent;
                            return ConfirmationPromt();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'clearance.js:2 ReasonQ() Answer error', error);
                    });
            });
    }

    function ConfirmationPromt() {
        const embed_test = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setDescription(`Reason ▼\n${reasonVar}`)
            .setFooter('Click ✅ to confirm and send the form.')
            .addFields(
                { name: 'Nickname ▼', value: `\`${nicknameVar}\``, inline: false },
                { name: 'Club Name ▼', value: clubNameVar, inline: true },
                { name: 'Role ▼', value: clubRoleVar, inline: false },
                { name: 'Requester ▼', value: `${requesterVar} • ${requesterVar?.tag} • ${requesterVar?.id}`, inline: false },
            )

        return message.channel.send(`> ${author} Are you **sure** to send this form?`, embed_test)
            .then(async Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    const emojiFilter = (reaction, user) => { // accept interaction only from the message author
                        return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && author === user;
                    }

                    Question.awaitReactions(emojiFilter, { max: 1, time: questionResponseTime })
                        .then(collected => {
                            const reaction = collected.first();

                            switch (reaction.emoji.name) {
                                case '✅': return postResults();
                                case '❌': return botReply('As you wish, cancelled!', message);
                                default: return;
                            }
                        })
                        .catch(error => {
                            if (error.message === "Cannot read property 'emoji' of undefined") return botReply(`❌ There was no reaction within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                            logger('error', `clearance.js:1 ConfirmationPromt() Error when user answered the question.`, error);
                        });

                    try {
                        await Question.react('✅');
                        await Question.react('❌');
                    } catch (error) {
                        if (error.message === 'Unknown Message') return;
                        botReply(`An unknown error occured ;(`, message);
                        logger('error', `clearance.js:2 ConfirmationPromt() Error to add reactions probably wrong emojis or missing permissions.`, error);
                    }
                } else return logger('warn', `clearance.js:3 ConfirmationPromt() Error to send the message`);
            }).catch(error => {
                botReply(`❌ An unknown error occured, try again later!`, message);
                logger(`clearance.js:4 ConfirmationPromt() Error`, error);
            });

    }

    function postResults() {
        const clearanceChannel = bot.guilds.cache.get(config.botDetails.TEAserverID).channels.cache.get(config.channels.requestChannelID); // find request channel on the main server
        if (!clearanceChannel) {
            logger('error', 'clearance.js:1 postResults() Missing clearance channel on TEA main server');
            return botReply('Error to send club clearance request, try again later ;-(', message);
        }
        else {
            // define the embed: send apply to clearance channel with provided information
            const embed_clearance_message = new Discord.MessageEmbed()
                .setColor('#0095ff')
                .setAuthor(`Clearance request to '${clubNameVar}' club!`, TEAlogo)
                .setDescription(reasonVar)
                .addFields(
                    { name: 'Nickname ▼', value: `\`${nicknameVar}\``, inline: false },
                    { name: 'Club Name ▼', value: clubNameVar, inline: true },
                    { name: 'Role ▼', value: clubRoleVar, inline: false },
                    { name: 'Requester ▼', value: `${requesterVar} • ${requesterVar?.tag} • ${requesterVar?.id}`, inline: false },
                )
                .setFooter('TEA Clearance Request')

            clearanceChannel.send(`${requesterVar} • ${requesterVar?.tag} • ${requesterVar?.id}`, embed_clearance_message)
                .then(() => botReply(`> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')}TEA clearance request has been sent!`, message))
                .catch(err => {
                    logger('error', 'clearance.js:2 postResults() Error to send embed message', err);
                    botReply('Error to send clearance request, try again later ;-(', message);
                });
        }
    }
}