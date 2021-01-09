const config = require("../bot-settings.json");
const { TEAemoji, TEAlogo, Discord, errorLog } = require("../tea");

module.exports.help = {
    name: "bug",
    description: "Allows people to report trove game bugs.",
    type: "dm",
    usage: `**${config.BotPrefix}bug** on direct message`
};

module.exports.run = async (bot, message) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                            tip                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

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

    function nicknameQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Character Details**\n\`\`\`Please provide your in-game name.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ nickname is too short.`).then(() => nicknameQuestion());

                        else if (Answer.first().content.length > 20)
                            return message.channel.send(`❌ character is too long (20).`).then(() => nicknameQuestion());

                        else {
                            qNickname = Answer.first().content;
                            qRequester = message.author;
                            return platformQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function platformQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Platform**\n\`\`\`Please, specify the platform you play on (PC, Xbox, PS4 NA, PS4 EU).\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ platform answer is too short.`).then(() => platformQuestion());

                        else if (Answer.first().content.length > 50)
                            return message.channel.send(`❌ platform answer is too long (50).`).then(() => platformQuestion());

                        else {
                            qPlatform = Answer.first().content;
                            return characterQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function characterQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Character Details**\n\`\`\`Please provide your basic in-game details.\ncharacter/level/power rank/mastery etc.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ character details are too short.`).then(() => characterQuestion());

                        else if (Answer.first().content.length > 200)
                            return message.channel.send(`❌ character details are too long (200).`).then(() => characterQuestion());

                        else {
                            qCharacter = Answer.first().content;
                            return dateQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function dateQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Time and Date**\n\`\`\`When did this happen? Give as specific a timeframe as possible (please include timezone).\nIf it's always bugged, that's helpful too, so you can just say that.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ date is too short.`).then(() => dateQuestion());

                        else if (Answer.first().content.length > 100)
                            return message.channel.send(`❌ date is too long (100).`).then(() => dateQuestion());

                        else {
                            qDate = Answer.first().content;
                            return contextQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function contextQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Context**\n\`\`\`Where did you find this bug? Was it in a specific biome? Which? A specific lair? Which?\nIf the bug is with a costume, which specific costume?\nThe more details you provide, the more quickly we'll be able to replicate the issue.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ context is too short.`).then(() => contextQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ context is too long (1024).`).then(() => contextQuestion());

                        else {
                            qContext = Answer.first().content;
                            return gameQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function gameQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Game Details**\n\`\`\`What are the name(s) of any involved quest/badges/item/clubs?\nPlease attempt to provide exact names as shown in-game or type none.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ game details are too short.`).then(() => gameQuestion());

                        else if (Answer.first().content.length > 100)
                            return message.channel.send(`❌ game details are too long (100).`).then(() => gameQuestion());

                        else {
                            qGame = Answer.first().content;
                            return expectedQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function expectedQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Expected**\n\`\`\`What did you expect to happen?\nExample: I summoned my mount and expected to spawn Slow Sebastion.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ expected answer is too short.`).then(() => expectedQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ expected answer is too long (1024).`).then(() => expectedQuestion());

                        else {
                            qExpected = Answer.first().content;
                            return observedQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function observedQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Observed**\n\`\`\`What happened instead?\nExample: My character threw a bomb.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ observed answer is too short.`).then(() => observedQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ observed answer too long (1024).`).then(() => observedQuestion());

                        else {
                            qObserved = Answer.first().content;
                            return reproductionQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function reproductionQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Reproduction Steps**\n\`\`\`Most importantly, if possible, please include a list of specific steps we can take to reproduce this issue on our end. \nThese steps need to be something we can reproduce on a new character, not isolated to your character only.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ reproduction steps answer is too short.`).then(() => reproductionQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ reproduction steps answer is too long (1024).`).then(() => reproductionQuestion());

                        else {
                            qRepro = Answer.first().content;
                            return mediaQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function mediaQuestion() {
        return message.reply(`${message.author} ${TEAemoji()} Type \`cancel\` to exit.\n\n**Image/Video Documentation**\n\`\`\`Often the most useful information we can get for bugs will be screenshots or video documentation of the bug occurring.\nThese can be uploaded to 3rd party websites (youtube/imgur) and you just have to include the link to them or type none if you don't have any.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.BotPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ media are too short.`).then(() => mediaQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ media are too long (1024).`).then(() => mediaQuestion());

                        else {
                            qMedia = Answer.first().content;
                            return postToMods(message);
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function postToMods(dmMessage) { // to make everything good with the command: SEND_MESSAGES / READ_MESSAGES / READ_MESSAGE_HISTORY / EMBED_LINKS
        const TEAchannel = bot.guilds.cache.get(config.HidenBugServerID).channels.cache.get(config.bugQueueChannelID);

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
                    { name: 'Image/Video Documentation', value: qMedia, inline: false }
                )
                .setThumbnail(qRequester.displayAvatarURL())
                .setFooter('React with ✅ below to move to the appropriate category')
                .setTimestamp()
            return TEAchannel.send(embed_tip_summary).catch(() => { dmMessage.channel.send(`${TEAemoji()} Error to send bug report, try again later...`); })
                .then(async message => {
                    if (message) dmMessage.channel.send(`${TEAemoji()} Your bug report has been successfully sent!`);
                    // userInputSummary();
                })
                .catch(error => { errorLog(`bug.js:1 postToMods() Error in the function - probably missing permissions (SEND_MESSAGES/READ_MESSAGES/READ_MESSAGE_HISTORY/EMBED_LINKS)`, error); })
        } else {
            dmMessage.channel.send(`${TEAemoji()} Error to send bug report, try again later...`);
            errorLog(`bug.js:2 postToMods() TEA bug queue chat channel is missing - maybe wrong channel ID in 'bugQueueChannelID' conf file: ${config.bugQueueChannelID}\n-------------------------------------------------`);
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