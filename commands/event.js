const { botReply, logger, sendEmbedLog, getEmoji } = require('../teaBot');
const config = require("../bot-settings.json");
const { checkEventCache, blockEventWhileProcessing, updateEventStatus } = require("../cache/tea-event-cache");
const { MongoClient } = require("../functions/mongodb-connection");
const { eventPriorityPrizeModel } = require("../schema/event-priority-prizes");
const { eventCodeModel } = require('../schema/event-codes');

module.exports.help = {
    name: "event",
    description: "Participate command in the TEA events.",
    type: "public",
    usage: `ℹ️ Format: **${config.botDetails.prefix}event code**\nℹ️ Example(s):\n${config.botDetails.prefix}event asd123zxc\n${config.botDetails.prefix}event remaining`
};

module.exports.run = async (bot, message, args) => {
    if (checkEventCache('eventstatus') === false) return botReply(`> ${message.author} There is no active event to participate, good luck next time 💙`, message);
    if (checkEventCache('blockevent') === true) return botReply(`> ${message.author}, I'm busy processing a request from someone else. Please try again in a few seconds.`, message);

    if (!args.length) return botReply(`Wrong command format, type **${config.botDetails.prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    const { author, guild } = message;
    const userCode = args[0]?.toLowerCase();

    if (userCode === 'remaining') { // event remaining logic
        return await MongoClient().then(async () => { // connect to the MongoDB

            Promise.all([eventCodeModel.find(), eventCodeModel.find({ available: true })]) // Create promise with MongoDB queries.
                .then(([allCodes, availableCodes]) => {

                    let codeHints = '';
                    availableCodes.forEach(code => codeHints = codeHints + `${code?.hint ? `\n${code.hint}` : ''}`); // Update codeHints string.
                    botReply(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} Event Codes Information\nEvent code pool: **${allCodes.length}**\nRemaining codes: **${availableCodes.length}**\n\n${codeHints ? `Hint(s): ${codeHints}` : ''}`, message);
                })
                .catch(err => {
                    logger('error', `event.js:1 remaining() Query error to MongoDB.`, err);
                    botReply(`> ${author} Database query error, try again later!`, message);
                });

        }).catch(err => {
            logger('error', `event.js:2 remaining() Connect error to MongoDB.`, err);
            botReply(`> ${author} Database connection error, try again later!`, message);
        });
    }

    // code handler logic
    blockEventWhileProcessing(true); // block command at the start to prevent other people use at this same time.
    await MongoClient().then(async () => { // connect to the MongoDB

        await eventCodeModel.findOne({ id: userCode, available: true })
            .then(async code => {

                if (code) { // If the document is found.
                    switch (code.type) { // Check type of code.
                        case 'fixed': { // Fixed type of code.
                            code.available = false; // Make the code unavailable
                            code.prize.userID = author.id; // Assign the user ID to the document.
                            code.prize.userTag = author.tag; // Assign the user tag to the document.

                            await code.save() // Save the document.
                                .then(updatedCodeDoc => {
                                    logger('event', `event.js:1 switch fixed() Document '${updatedCodeDoc.id}' has been successfully claimed by the '${author.tag}'(${author.id}).`);
                                    botReply(`> Congratulations ${author}, you won: **${updatedCodeDoc.prize.item}**!\n${getEmoji(config.botDetails.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!`, message);
                                    sendEmbedLog(`<@${updatedCodeDoc.prize.userID}> | ${updatedCodeDoc.prize.userTag} | ${updatedCodeDoc.prize.userID}\nUser has claimed **${updatedCodeDoc.prize.item}** (${updatedCodeDoc.type} prize type) using **${updatedCodeDoc.id}** code on the **${guild?.name}** server.`, config.webhooks.eventLogs.channelID, config.webhooks.eventLogs.loggerName);
                                })
                                .catch(err => {
                                    logger('error', `event.js:2 switch fixed() Query error to MongoDB. Error to save the document '${code.id}' claimed by the '${author.tag}'(${author.id}).`, err);
                                    botReply(`> ${author}, Database query error, try again.`, message);
                                });

                            await checkAmountOfDocumentsAndDisableIfZero(); // Check if any available codes left, if so disable the system.
                            return blockEventWhileProcessing(false); // Unlock the command.
                        }
                        case 'priority': { // Priority type of code.
                            // Find one code document with 'high' priority status.
                            const priorityPrizeDoc = await eventPriorityPrizeModel.find({ available: true }).sort({ priority: 1 }).limit(1).exec();

                            if (priorityPrizeDoc.length > 0) { // If prize document is available.
                                // Code Document.
                                code.available = false; // Make the code unavailable.
                                code.prize.userID = author.id; // Assign the user ID to the document.
                                code.prize.userTag = author.tag; // Assign the user tag to the document.
                                code.prize.item = priorityPrizeDoc[0].name; // Asign priority prize document to the document.

                                // Prize Document.
                                priorityPrizeDoc[0].available = false; // Set prize document to unavailable.

                                // Save the documents with updated information.
                                await Promise.all([priorityPrizeDoc[0].save(), code.save()])
                                    .then(([prizeDoc, codeDoc]) => {
                                        logger('event', `event.js:1 switch priority() Document '${codeDoc.id}' and '${prizeDoc.name}' has been successfully claimed by the '${author.tag}'(${author.id}).`);
                                        botReply(`> Congratulations ${author}, you won: **${prizeDoc.name}**!\n${getEmoji(config.botDetails.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!`, message);
                                        sendEmbedLog(`<@${codeDoc.prize.userID}> | ${codeDoc.prize.userTag} | ${codeDoc.prize.userID}\nUser has claimed **${prizeDoc.name}** (${prizeDoc.priority} ${codeDoc.type} prize type) using **${codeDoc.id}** code on the **${guild?.name}** server.`, config.webhooks.eventLogs.channelID, config.webhooks.eventLogs.loggerName);
                                    })
                                    .catch(err => {
                                        logger('error', `event.js:2 switch priority() Query error to MongoDB. Error to save document(s) '${code.id}' or/and '${priorityPrizeDoc[0].name}' claimed by the '${author.tag}'(${author.id}).`, err);
                                        botReply(`> Congratulations ${author} you probably won something, but due to a bug with the database I'm not able to save it.\nTry to use this code again in a second. If you can't claim the code let that know to **${config.botDetails.owner.tag}**!`, message);
                                    });

                            } else { // If not enough prize documents in the database.
                                // Code Document.
                                code.available = false; // Make the code unavailable.
                                code.prize.userID = author.id; // Assign the user ID to the document.
                                code.prize.userTag = author.tag; // Assign the user tag to the document.
                                code.prize.item = 'Prize document is not assigned'; // Asign priority prize document to the document.

                                await code.save() // Save the document.
                                    .then(updatedCodeDoc => {
                                        sendEmbedLog(`<@${updatedCodeDoc.prize.userID}> | ${updatedCodeDoc.prize.userTag} | ${updatedCodeDoc.prize.userID}\nUser has claimed **${updatedCodeDoc.prize.item}** (${updatedCodeDoc.type} prize type) using **${updatedCodeDoc.id}** code on the **${guild?.name}** server.`, config.webhooks.eventLogs.channelID, config.webhooks.eventLogs.loggerName);
                                        logger('warn', `event.js:3 switch priority() No prize document to assing to the '${code.id}' claimed by the '${author.tag}'(${author.id}).`);
                                        botReply(`> Congratulations ${author}! You won **something**, but due to a bug, I can't show exactly what it is.\n${getEmoji(config.botDetails.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!\n\nPlease make a screenshot of this message and report it to **${config.botDetails.owner.tag}**\nTimestamp: \`${Date.now()}\``, message);
                                    })
                                    .catch(err => {
                                        logger('error', `event.js:4 switch fixed() Query error to MongoDB. Error to save the document '${code.id}' claimed by the '${author.tag}'(${author.id}).`, err);
                                        botReply(`> ${author}, Database query error, try again.`, message);
                                    });
                            }

                            await checkAmountOfDocumentsAndDisableIfZero(); // Check if any available codes left, if so disable the system.
                            return blockEventWhileProcessing(false); // Unlock the command.
                        }
                        default: return logger('error', `event.js:1 default switch() This case not should be fired.`);
                    }

                } else { // When findOne function didn't find anything.
                    botReply(`> ${author} ❌ Failed to redeem, this code is invalid or already claimed.`, message);
                    blockEventWhileProcessing(false); // unlock the command.
                }

            }).catch(err => {
                // query error to findOne
                logger('error', `event.js:1 switch main() Query error to MongoDB.`, err);
                botReply(`Database query error, try again later!`, message);
            });

    }).catch(err => {
        logger('error', `event.js:1 main() Connect error to MongoDB.`, err);
        botReply(`> ${author} Database connection error, try again later!`, message);
    });

    async function checkAmountOfDocumentsAndDisableIfZero() {
        await eventCodeModel.countDocuments({ available: true })
            .then(async docsAmount => {
                if (docsAmount === 0) {
                    await updateEventStatus(false, (err, res) => {
                        if (err) logger('error', `event.js:1 checkAmountOfDocumentsAndDisableIfZero() ${err}`);
                        else logger('log', `event.js:2 checkAmountOfDocumentsAndDisableIfZero() ${res.message}`);
                    });
                }
            }).catch(err => logger('error', `event.js:3 checkAmountOfDocumentsAndDisableIfZero() Query error to MongoDB.`, err));
    }
};