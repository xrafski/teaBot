const config = require("../bot-settings.json");
const { TEAlogo, Discord, errorLog, getEmoji } = require('../teaBot');

module.exports.help = { 
    name: "tip",
    description: "Report players privately.",
    type: "disabled",
    usage: `**${config.botPrefix}tip** on direct message with the bot.`
};

module.exports.run = async (bot, message) => {
    let qRequester;
    let qUser = 'None';
    let qDescription = 'None';
    let qDate = 'None';
    let qServer = 'None';
    let qWorld = 'None';
    let qProof = 'None';
    let qNote = 'None';
    const filter = m => m.author.id === message.author.id;

    nameQuestion(); // 1st question about the reported username.

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

    //////////////////////////////////////////////////////////////////////////////////////////////

    function nameQuestion() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`Please enter the name of the user you want to report.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 3)
                            return message.channel.send(`❌ Nickname is too short.`).then(() => nameQuestion());

                        else if (Answer.first().content.length > 20)
                            return message.channel.send(`❌ Nickname is too long (20).`).then(() => nameQuestion());

                        else {
                            qUser = Answer.first().content;
                            qRequester = message.author;
                            return descriptionQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function descriptionQuestion() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`Description of the ToS breaker.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ Description is too short.`).then(() => descriptionQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ Description is too long (1024).`).then(() => descriptionQuestion());

                        else {
                            qDescription = Answer.first().content;
                            return dateQuestion1();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function dateQuestion1() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`Is this occurring at the time of this tip being sent? (Yes/No)\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.toLowerCase() === 'y' || Answer.first().content.toLowerCase() === 'yes') {
                            qDate = '(now) ' + currentUTCDate();
                            return serverQuestion();
                        }

                        else if (Answer.first().content.toLowerCase() === 'n' || Answer.first().content.toLowerCase() === 'no')
                            return dateQuestion2();

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ date is too short.`).then(() => dateQuestion1());

                        else return message.channel.send(`❌ Incorrect answer, only YES/NO is accepted.`).then(() => dateQuestion1());

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function dateQuestion2() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`Provide us date and time when this accident happened (please include your timezone).\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ date is too short.`).then(() => dateQuestion2());

                        else if (Answer.first().content.length > 100)
                            return message.channel.send(`❌ date is too long (100).`).then(() => dateQuestion2());

                        else {
                            qDate = Answer.first().content;
                            return serverQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function serverQuestion() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`What server? (EU/NA).\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ server is too short.`).then(() => serverQuestion());

                        else if (Answer.first().content.toLowerCase() === 'eu' || Answer.first().content.toLowerCase() === 'na') {
                            qServer = Answer.first().content;
                            return worldQuestion();
                        }
                        else return message.channel.send(`❌ Incorrect answer, only EU/NA is accepted.`).then(() => serverQuestion());

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function worldQuestion() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`If you have worldID, please enter it now or type none to go to the next question.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ world is too short.`).then(() => worldQuestion());

                        else if (Answer.first().content.length > 200)
                            return message.channel.send(`❌ world is too long (200).`).then(() => worldQuestion());

                        else {
                            qWorld = Answer.first().content;
                            return proofQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function proofQuestion() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`Please, link any proofs that you have images/videos that will be used for evidence or type none if you don't have any.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ proof is too short.`).then(() => proofQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ proof is too long (1024).`).then(() => proofQuestion());

                        else {
                            qProof = Answer.first().content;
                            return noteQuestion();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function noteQuestion() {
        return message.reply(`${message.author} ${getEmoji(config.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\`\`\`Now you can enter an additional note to the tip, and if you don't want then type none to finish.\`\`\``)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: 180000 })
                    .then(Answer => {
                        Question.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel')
                            return message.channel.send(`❌ Cancelled`);

                        else if (Answer.first().content.length < 1)
                            return message.channel.send(`❌ note is too short.`).then(() => noteQuestion());

                        else if (Answer.first().content.length > 1024)
                            return message.channel.send(`❌ note is too long (1024).`).then(() => noteQuestion());

                        else {
                            qNote = Answer.first().content;
                            return postToMods(message).then(() => {
                                // message.channel.send(`${getEmoji(config.TEAserverID, 'TEA')} Your tip has been successfully sent!`);
                                // userInputSummary();
                            });
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`❌ There was no message within the time limit (3mins)! - Cancelled.`);
                        else return;
                    });
            });
    }

    function postToMods(dmMessage) {
        const TEAchannel = bot.guilds.cache.get(config.TEAserverID).channels.cache.get(config.other.officialChannelID);

        if (TEAchannel) {
            //define the embed: tip embed message summary
            let embed_tip_summary = new Discord.MessageEmbed()
                .setColor('#fcec03')
                .setAuthor(`New Tip`, TEAlogo)
                .setTitle(`Sent by ${qRequester.tag} (${qRequester.id})‏‏‎ ‎\n‏‏‎ ‎\n`)
                .addFields(
                    { name: 'Username', value: qUser, inline: false },
                    { name: 'Description', value: qDescription, inline: false },
                    { name: 'Date', value: qDate, inline: false },
                    { name: 'Server', value: qServer, inline: false },
                    { name: 'World ID', value: qWorld, inline: false },
                    { name: 'Proof', value: qProof, inline: false },
                    { name: 'Additional Note', value: qNote, inline: false },
                )
                .setThumbnail(bot.user.displayAvatarURL())
                .setFooter('React with ✅ or ❌ to validate this tip')
                .setTimestamp()
            return TEAchannel.send(embed_tip_summary)
                .then(async message => {
                    await message.react('✅');
                    await message.react('❌');
                    await dmMessage.channel.send(`${getEmoji(config.TEAserverID, 'TEA')} Your tip has been successfully sent!`);
                })
                .catch(error => {
                    dmMessage.channel.send(`${getEmoji(config.TEAserverID, 'TEA')} Error to send tip, try again later...`);
                    errorLog(`tip.js:1 postToMods() Error in the function - probably missing permissions (READ/SEND/REACT)\n-------------------------------------------------\nUser tip summary:\nqUser: ${qUser}\nqDescription: ${qDescription}\nqDate: ${qDate}\nqServer: ${qServer}\nqWorld: ${qWorld}\nqProof: ${qProof}\nqNote: ${qNote}\nqRequester: ${qRequester} - ${qRequester.tag} - ${qRequester.id}`, error)
                })
        } else {
            dmMessage.channel.send(`${getEmoji(config.TEAserverID, 'TEA')} Error to send tip, try again later...`);
            errorLog(`tip.js:2 postToMods() TEA official chat channel is missing - maybe wrong channel ID in 'TEAofficialChannel' conf file: ${config.other.officialChannelID}\n-------------------------------------------------\nUser tip summary:\nqUser: ${qUser}\nqDescription: ${qDescription}\nqDate: ${qDate}\nqServer: ${qServer}\nqWorld: ${qWorld}\nqProof: ${qProof}\nqNote: ${qNote}\nqRequester: ${qRequester} - ${qRequester.tag} - ${qRequester.id}`);
        }
    }

    // function userInputSummary() {
    //     return console.debug(`-------------------------------------------------\nUser input summary:\nqUser: ${qUser}\nqDescription: ${qDescription}\nqDate: ${qDate}\nqServer: ${qServer}\nqWorld: ${qWorld}\nqProof: ${qProof}\nqNote: ${qNote}\nqRequester: ${qRequester} - ${qRequester.tag} - ${qRequester.id}`);
    //     // return message.channel.send(`-------------------------------------------------\n**User input summary:**\nqUser: ${qUser}\nqDescription: ${qDescription}\nqDate: ${qDate}\nqServer: ${qServer}\nqWorld: ${qWorld}\nqProof: ${qProof}\nqNote: ${qNote}\nqRequester: ${qRequester} - ${qRequester.tag} - ${qRequester.id}`);
    // }

}