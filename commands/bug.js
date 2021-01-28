const config = require("../bot-settings.json");
const { TEAlogo, Discord, errorLog, getEmoji, botReply } = require('../teaBot');

module.exports.help = {
    name: "bug",
    description: "Report trove game bugs.",
    type: "dm",
    usage: `**${config.botPrefix}bug** on direct message with the bot.`
};

module.exports.run = async (bot, message) => {
    let qRequester;
    let qNickname = 'None';
    let qPlatform = 'None';
    let qCharacter = 'None';
    let qDate = 'None';
    let qContext = 'None';
    let qGame = 'None';
    let qExpected = 'None';
    let qObserved = 'None';
    let qRepro = 'None';
    let qMedia = 'None';
    let qNote = 'None';

    const filter = m => m.author.id === message.author.id;
    const questionResponseTime = 1500000;

    nicknameQuestion(); // 1st question about the bug report.

    //////////////////////////////////////////////////////////////////////////////////////////////

    function currentUTCDate() {

        function pad2(number) {
            return (number < 10 ? '0' : '') + number;
        }

        function dayOfWeekAsString(dayIndex) {
            return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex] || '';
        }

        function MonthAsString(dayIndex) {
            return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][dayIndex] || '';
        }

        function formatAMPM(date) {
            var hours = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }

        const date = new Date();
        // return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
        return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${formatAMPM(date)} UTC`;
    }

    function nicknameQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Character Details**\n\`\`\`Please provide your in-game name.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 nicknameQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 3)
                            return nicknameQuestion('❌ Nickname is too short [3 characters].');

                        else if (Answer.first().content.length > 20)
                            return nicknameQuestion('❌ Nickname is too long [20 characters].');

                        else {
                            qNickname = Answer.first().content;
                            qRequester = message.author;
                            return platformQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 nicknameQuestion() ${error}`);
                    });
            });
    }

    function platformQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Platform**\n\`\`\`Please, specify the platform you play on (PC, Xbox, PS4 NA, PS4 EU).\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 platformQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return platformQuestion('❌ Platform answer is too short.');

                        else if (Answer.first().content.length > 50)
                            return platformQuestion('❌ Platform answer is too long [50 characters].');

                        else {
                            qPlatform = Answer.first().content;
                            return characterQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 platformQuestion() ${error}`);
                    });
            });
    }

    function characterQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Character Details**\n\`\`\`Please provide your basic in-game details.\ncharacter/level/power rank/mastery etc.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 characterQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return characterQuestion('❌ Character details are too short.');

                        else if (Answer.first().content.length > 250)
                            return characterQuestion('❌ Character details are too long [250 characters].');

                        else {
                            qCharacter = Answer.first().content;
                            return dateQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 characterQuestion() ${error}`);
                    });
            });
    }

    function dateQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Time and Date**\n\`\`\`When did this happen? Give as specific a timeframe as possible (please include timezone).\nIf it's always bugged, that's helpful too, so you can just say that.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 dateQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return dateQuestion('❌ Date is too short.');

                        else if (Answer.first().content.length > 250)
                            return dateQuestion('❌ Date is too long [250 characters].');

                        else {
                            qDate = Answer.first().content;
                            return contextQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 dateQuestion() ${error}`);
                    });
            });
    }

    function contextQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Context**\n\`\`\`Where did you find this bug? Was it in a specific biome? Which? A specific lair? Which?\nIf the bug is with a costume, which specific costume?\nThe more details you provide, the more quickly we'll be able to replicate the issue.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 contextQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return contextQuestion('❌ Context is too short.');

                        else if (Answer.first().content.length > 1000)
                            return contextQuestion('❌ Context is too long [1000 characters].');

                        else {
                            qContext = Answer.first().content;
                            return gameQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 contextQuestion() ${error}`);
                    });
            });
    }

    function gameQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Game Details**\n\`\`\`What are the name(s) of any involved quest/badges/item/clubs?\nPlease attempt to provide exact names as shown in-game or type none.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 gameQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return gameQuestion('❌ Game details are too short.');

                        else if (Answer.first().content.length > 500)
                            return gameQuestion('❌ Game details are too long [500 characters].');

                        else {
                            qGame = Answer.first().content;
                            return expectedQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 gameQuestion() ${error}`);
                    });
            });
    }

    function expectedQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Expected**\n\`\`\`What did you expect to happen?\nExample: I summoned my mount and expected to spawn Slow Sebastion.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 expectedQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return expectedQuestion('❌ Expected answer is too short.');

                        else if (Answer.first().content.length > 1000)
                            return expectedQuestion('❌ Expected answer is too long [1000 characters].');

                        else {
                            qExpected = Answer.first().content;
                            return observedQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 expectedQuestion() ${error}`);
                    });
            });
    }

    function observedQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return message.reply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Observed**\n\`\`\`What happened instead?\nExample: My character threw a bomb.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 observedQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return observedQuestion('❌ Observed answer is too short.');

                        else if (Answer.first().content.length > 1000)
                            return observedQuestion('❌ Observed answer too long [1000 characters].');

                        else {
                            qObserved = Answer.first().content;
                            return reproductionQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 observedQuestion() ${error}`);
                    });
            });
    }

    function reproductionQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Reproduction Steps**\n\`\`\`Most importantly, if possible, please include a list of specific steps we can take to reproduce this issue on our end. \nThese steps need to be something we can reproduce on a new character, not isolated to your character only.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 reproductionQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return reproductionQuestion('❌ Reproduction steps answer is too short.');

                        else if (Answer.first().content.length > 1000)
                            return reproductionQuestion('❌ Reproduction steps answer is too long [1000 characters].');

                        else {
                            qRepro = Answer.first().content;
                            return mediaQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 reproductionQuestion() ${error}`);
                    });
            });
    }

    function mediaQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Image/Video Documentation**\n\`\`\`Often the most useful information we can get for bugs will be screenshots or video documentation of the bug occurring.\nThese can be uploaded to 3rd party websites (youtube/imgur) and you just have to include the link to them or type none if you don't have any.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 mediaQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return mediaQuestion('❌ Media are too short.');

                        else if (Answer.first().content.length > 1000)
                            return mediaQuestion('❌ Media are too long [1000 characters].');

                        else {
                            qMedia = Answer.first().content;
                            return noteQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 mediaQuestion() ${error}`);
                    });
            });
    }

    function noteQuestion(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**` : '');

        return botReply(`${additionalText}\n${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Note**\n\`\`\`Now you can insert a note. It might be your idea to fix this bug or anything else.\nYou can also type 'none' to proceed without this note.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        if (Question.deleteable) Question.delete().catch((error) => console.error(`bug.js:1 noteQuestion() Error to remove question ${error}`));
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return botReply(`❌ Cancelled`, message);

                        else if (Answer.first().content.length < 1)
                            return noteQuestion('❌ Note is too short.');

                        else if (Answer.first().content.length > 1000)
                            return noteQuestion('❌ Note is too long [1000 characters].');

                        else {
                            qNote = Answer.first().content;
                            return postToMods(message);
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else console.error(`bug.js:2 noteQuestion() ${error}`);
                    });
            });
    }

    function postToMods(dmMessage) {
        const TEAchannel = bot.guilds.cache.get(config.report.hidenBugServerID).channels.cache.get(config.report.bugQueueChannelID);

        if (TEAchannel) {
            //define the embed: tip embed message summary
            let embed_tip_summary = new Discord.MessageEmbed()
                .setColor('#fcec03')
                .setAuthor(`Bug Report`, TEAlogo)
                .setTitle(`Sent by ${qRequester.tag} (${qRequester.id})‏‏‎`)
                .addFields(
                    { name: 'Nickname', value: qNickname, inline: false },
                    { name: 'Platform', value: qPlatform, inline: false },
                    { name: 'Character Details', value: qCharacter, inline: false },
                    { name: 'Time', value: qDate, inline: false },
                    { name: 'Game Item Details', value: qGame, inline: false },
                    { name: 'Expected', value: qExpected, inline: false },
                    { name: 'Observed', value: qObserved, inline: false },
                    { name: 'Reproduction Steps', value: qRepro, inline: false },
                    { name: 'Image/Video Documentation', value: qMedia, inline: false },
                    { name: 'Note', value: qNote, inline: false }
                )
                .setThumbnail(qRequester.displayAvatarURL())
                .setFooter('React with ✅ below to move to the appropriate category')
                .setTimestamp()
            return TEAchannel.send(embed_tip_summary)
                .then(async message => {
                    if (message) botReply(`${getEmoji(config.TEAserverID, 'TEA')} Your bug report has been successfully sent!`, dmMessage);
                })
                .catch(error => {
                    botReply(`${getEmoji(config.TEAserverID, 'TEA')} Error to send bug report, try again later...`, dmMessage);
                    errorLog(`bug.js:1 postToMods() Error in the function - probably missing permissions (SEND_MESSAGES/READ_MESSAGES/READ_MESSAGE_HISTORY/EMBED_LINKS)`, error);
                    userInputSummary();
                });
        } else {
            dmMessage.channel.send(`${getEmoji(config.TEAserverID, 'TEA')} Error to send bug report, try again later...`);
            errorLog(`bug.js:2 postToMods() TEA bug queue chat channel is missing or maybe wrong channelID in 'bugQueueChannelID' conf file: ${config.report.bugQueueChannelID}`, 'Check console for more info!');
            userInputSummary();
        }
    }

    function userInputSummary() {
        return console.debug(`-----------------------------------
User input summary:
qNickname: ${qNickname}
qPlatform: ${qPlatform}
qCharacter: ${qCharacter}
qDate: ${qDate}
qContext: ${qContext}
qGame: ${qGame}
qExpected: ${qExpected}
qObserved: ${qObserved}
qRepro: ${qRepro}
qMedia: ${qMedia}
qRequester: ${qRequester} - ${qRequester.tag} - ${qRequester.id}`);
    }
}