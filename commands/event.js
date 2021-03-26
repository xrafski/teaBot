const config = require("../bot-settings.json");
const { checkEventCache, remainingCodes, codeValidation, updateCodeCache, blockEventWhileProcessing } = require("../cache/tea-event-cache");
const { MongoClient } = require("../functions/mongodb-connection");
const { eventFixedCodeModel } = require("../schema/event-codes-fixed");
const { eventPriorityCodeModel } = require("../schema/event-codes-priority");
const { eventPriorityPrizeModel } = require("../schema/event-priority-prizes");
const { botReply, logger, sendEmbedLog, getEmoji } = require('../teaBot');

module.exports.help = {
    name: "event",
    description: "Participate command in the TEA events.",
    type: "public",
    usage: `ℹ️ Format: **${config.botPrefix}event code**\nℹ️ Example(s):\n${config.botPrefix}event asd123zxc\n${config.botPrefix}event remaining`
};

module.exports.run = async (bot, message, args) => {
    if (checkEventCache('eventstatus') === false) return botReply(`There is no active event to participate!`, message);
    if (checkEventCache('blockevent') === true) return botReply(`I'm busy processing someone's request. Please try again in a second or two.`, message);

    if (!args.length) return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    const { author, guild } = message;
    const userCode = args[0]?.toLowerCase();

    if (userCode === 'remaining') return botReply(`${getEmoji(config.TEAserverID, 'TEA')} Event Codes Information\nEvent code pool: **${remainingCodes().totalCodes}**\nRemaining codes: **${remainingCodes().availableCodes}**\n\n${remainingCodes().availableHints ? `Hint(s): ${remainingCodes().availableHints}` : ``}`, message);

    if (codeValidation(userCode).code === 'correct_code') { // check if code can be claimed
        blockEventWhileProcessing(true); // block command at the start to prevent other people

        switch (codeValidation(userCode).type) {

            case 'fixed': {
                logger('event', `event.js:1 switch fixed() '${userCode}' code passed validation with 'correct_code' status and 'fixed' type.`);

                await MongoClient().then(async () => { // connect to the MongoDB

                    // Run query to find document with userCode provided.
                    await eventFixedCodeModel.findOneAndUpdate({ id: userCode }, { '$set': { 'available': false, 'prize.userID': author.id, 'prize.userTag': author.tag } }, { new: true }).exec()
                        .then(codeDocument => {

                            if (codeDocument) {  // document with 'userCode' id is found
                                updateCodeCache(userCode, { available: false }); // disable key from cache
                                logger('event', `event.js:2 switch fixed() Document '${codeDocument.id}' has been successfully updated by the '${author.tag}'(${author.id}).`);
                                botReply(`Congratulations, you won: **${codeDocument.prize.item}**!\n${getEmoji(config.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!`, message);
                                sendEmbedLog(`<@${codeDocument.prize.userID}> | ${codeDocument.prize.userTag} | ${codeDocument.prize.userID}\nUser has claimed **${codeDocument.prize.item}** (${codeDocument.type} prize type) using **${codeDocument.id}** code on the **${guild?.name}** server.`, config.eventLogs.channelID, config.eventLogs.loggerName);
                            }

                            else { // document is not found for this userCode which shound not happend
                                logger('error', `event.js:3 switch fixed() Document is not found for '${userCode}' code by the '${author.tag}'(${author.id}) user request.`);
                                botReply(`Document with your code is not found which might be a bug.\nPlease make a screenshot of this message and report it to **${config.ownerTag}**\nTimestamp: \`${Date.now()}\``, message);
                            }
                        }).catch(err => {
                            logger('error', `event.js:4 switch fixed() Error to run MongoDB model query`, err);
                            botReply(`Database error, try again later!`, message);
                        });

                }).catch(err => {
                    logger('error', `event.js:5 switch fixed() Connect error to MongoDB.`, err);
                    botReply(`Database error, try again later!`, message);
                });

                return blockEventWhileProcessing(false); // unlock
            }

            case 'priority': {
                logger('event', `event.js:1 swith priority() '${userCode}' code passed validation with 'correct_code' status and 'priority' type.`);

                await MongoClient().then(async () => { // connect to the MongoDB

                    // Find one code document with 'high' priority status.
                    await eventPriorityPrizeModel.findOne({ priority: 'high', available: true }).exec()
                        .then(async highPrize => {

                            if (highPrize) { // if document with 'high' priority is found.

                                // change cache/database available value for priority prize code to FALSE
                                await eventPriorityCodeModel.findOne({ id: userCode, available: true }).exec()
                                    .then(async codeDocument => {

                                        if (codeDocument) { // check if document is found
                                            codeDocument.available = false; // make the code not available anymore
                                            codeDocument.userID = author.id; // assign userID to the document
                                            codeDocument.userTag = author.tag; // same as above but with authorTag
                                            codeDocument.prizeID = highPrize.timestamp; // assign prize document ID in the code document

                                            highPrize.available = false; // set prize document as not available to claim

                                            const updatedPrizeDoc = await highPrize.save(); // save prize document
                                            const updatedCodeDoc = await codeDocument.save(); // save code document

                                            if (updatedCodeDoc === codeDocument && updatedPrizeDoc === highPrize) { // when both documents are update correctly
                                                updateCodeCache(userCode, { available: false }); // disable key from cache
                                                logger('event', `event.js:2 switch priority() Document '${codeDocument.id}' and '${highPrize.timestamp}' has been successfully updated by the '${author.tag}'(${author.id}).`);
                                                botReply(`Congratulations, you won: **${highPrize.name}**!\n${getEmoji(config.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!`, message);
                                                sendEmbedLog(`<@${codeDocument.userID}> | ${codeDocument.userTag} | ${codeDocument.userID}\nUser has claimed **${highPrize.name}** (${highPrize.priority} ${codeDocument.type} prize type) using **${codeDocument.id}** code on the **${guild?.name}** server.`, config.eventLogs.channelID, config.eventLogs.loggerName);
                                            }
                                            else { // when one of documents failed to update
                                                updateCodeCache(userCode, { available: false }); // disable key from cache
                                                logger('error', `event.js:3 switch priority() Failed to update '${codeDocument.id}' or '${highPrize.timestamp}' document request by '${author.tag}'(${author.id}) user.`);
                                                botReply(`Congratulations, you won: **${highPrize.name}**!\n${getEmoji(config.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!\nHowever, there was an issue with saving document changes.\nPlease make a screenshot of this message and report it to **${config.ownerTag}**\nTimestamp: \`${Date.now()}\``, message);
                                                sendEmbedLog(`<@${codeDocument.userID}> | ${codeDocument.userTag} | ${codeDocument.userID}\nUser has claimed **${highPrize.name}** (${highPrize.priority} ${codeDocument.type} prize type) using **${codeDocument.id}** code on the **${guild?.name}** server.\n_However, there was an issue with saving document changes._`, config.eventLogs.channelID, config.eventLogs.loggerName);
                                            }
                                        }
                                        else { // document is not found for this userCode which shound not happend
                                            logger('error', `code.js:4 switch priority() Error to find '${userCode}' document provided by the '${author.tag}'(${author.id}).`);
                                            botReply(`Error to find document with provided code, try again or/and contact **${config.ownerTag}** to investigate.\nTimestamp: ${Date.now()}`, message);
                                        }

                                    }).catch(err => {
                                        logger('error', `event.js:5 switch priority() Error to run MongoDB model query`, err);
                                        botReply(`Database error, try again later!`, message);
                                    });

                            } else { // try to give 'low' prize instead

                                // Find one code document with 'low' priority status.
                                await eventPriorityPrizeModel.findOne({ priority: 'low', available: true }).exec()
                                    .then(async lowPrize => {

                                        if (lowPrize) { // if document with 'low' priority is found.

                                            // change cache/database available value for priority prize code to FALSE
                                            await eventPriorityCodeModel.findOne({ id: userCode, available: true }).exec()
                                                .then(async codeDocument => {

                                                    if (codeDocument) { // check if document is found
                                                        codeDocument.available = false; // make the code not available anymore
                                                        codeDocument.userID = author.id; // assign userID to the document
                                                        codeDocument.userTag = author.tag; // same as above but with authorTag
                                                        codeDocument.prizeID = lowPrize.timestamp; // assign prize document ID in the code document

                                                        lowPrize.available = false; // set prize document as not available to claim

                                                        const updatedPrizeDoc = await lowPrize.save(); // save prize document
                                                        const updatedCodeDoc = await codeDocument.save(); // save code document

                                                        if (updatedCodeDoc === codeDocument && updatedPrizeDoc === lowPrize) { // when both documents are update correctly
                                                            updateCodeCache(userCode, { available: false }); // disable key from cache
                                                            logger('event', `event.js:6 switch priority() Document '${codeDocument.id}' and '${lowPrize.timestamp}' has been updated successfully by the '${author.tag}'(${author.id}).`);
                                                            botReply(`Congratulations! You won: **${lowPrize.name}**!\n${getEmoji(config.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!`, message);
                                                            sendEmbedLog(`<@${codeDocument.userID}> | ${codeDocument.userTag} | ${codeDocument.userID}\nUser has claimed **${lowPrize.name}** (${lowPrize.priority} ${codeDocument.type} prize type) using **${codeDocument.id}** code on the **${guild?.name}** server.`, config.eventLogs.channelID, config.eventLogs.loggerName);
                                                        }
                                                        else { // when one of documents failed to update
                                                            updateCodeCache(userCode, { available: false }); // disable key from cache
                                                            logger('error', `event.js:7 switch priority() Failed to update '${codeDocument.id}' or '${lowPrize.timestamp}' document request by '${author.tag}'(${author.id}) user.`);
                                                            botReply(`Congratulations! You won: **${lowPrize.name}**!\n${getEmoji(config.TEAserverID, 'TEA')} After the event, we will contact you to claim your prize!\nHowever, there was an issue with saving document changes.\nPlease make a screenshot of this message and report it to **${config.ownerTag}**\nTimestamp: \`${Date.now()}\``, message);
                                                            sendEmbedLog(`<@${codeDocument.userID}> | ${codeDocument.userTag} | ${codeDocument.userID}\nUser has claimed **${lowPrize.name}** (${lowPrize.priority} ${codeDocument.type} prize type) using **${codeDocument.id}** code on the **${guild?.name}** server.\n_However, there was an issue with saving document changes._`, config.eventLogs.channelID, config.eventLogs.loggerName);
                                                        }
                                                    }

                                                    else { // document is not found for this userCode which shound not happend
                                                        logger('error', `event.js:8 switch fixed() Error to find '${userCode}' document provided by the '${author.tag}'(${author.id}).`);
                                                        botReply(`Error to find document with provided code, try again or/and contact **${config.ownerTag}** to investigate.\nTimestamp: ${Date.now()}`, message);
                                                    }

                                                }).catch(err => {
                                                    logger('error', `event.js:9 switch priority() Error to run MongoDB model query`, err);
                                                    botReply(`Database error, try again later!`, message);
                                                });

                                        } else {  // WHAT WHEN THERE IS NOT EVEN LOW PRIZE AVAILABLE - aka more codes than prizes
                                            logger('error', `event.js:10 switch priority() Low prize document is not found for '${author.tag}'(${author.id}) that used '${userCode}' code!`);

                                            await eventPriorityCodeModel.findOneAndUpdate({ id: userCode }, { '$set': { available: false, userID: author.id, userTag: author.tag, prizeID: 'No prize document available' } }, { new: true })
                                                .then(codeDoc => {

                                                    if (codeDoc) { // check if document exist and updated
                                                        updateCodeCache(userCode, { available: false }); // disable key from cache
                                                        logger('error', `event.js:11 switch priority() Updated '${userCode}' document, but without prize assigned to it.`);
                                                        botReply(`Congratulations! You won **something**, but due to a bug, I can't show exactly what it is.\nPlease make a screenshot of this message and report it to **${config.ownerTag}**\nTimestamp: \`${Date.now()}\``, message);
                                                        sendEmbedLog(`<@${codeDoc.userID}> | ${codeDoc.userTag} | ${codeDoc.userID}\nUser has claimed **undefined prize** using **${codeDoc.id}** code on the **${guild?.name}** server.\n_There wasn't a document with the prize to assign to this code._`, config.eventLogs.channelID, config.eventLogs.loggerName);
                                                    }

                                                    else { // document is not found for this userCode which shound not happend
                                                        logger('error', `event.js:12 switch priority() Error to find '${userCode}' document provided by the '${author.tag}'(${author.id}).`);
                                                        botReply(`Error to find document with provided code, try again or/and contact **${config.ownerTag}** to investigate.\nTimestamp: ${Date.now()}`, message);
                                                    }

                                                }).catch(err => {
                                                    logger('error', `event.js:13 switch priority() Error to run MongoDB model query`, err);
                                                    botReply(`Database error, try again later!`, message);
                                                });

                                        }

                                    }).catch(err => {
                                        logger('error', `event.js:14 switch priority() Error to run MongoDB model query`, err);
                                        botReply(`Database error, try again later!`, message);
                                    });

                            }

                        }).catch(err => {
                            logger('error', `event.js:15 switch priority() Error to run MongoDB model query`, err);
                            botReply(`Database error, try again later!`, message);
                        });

                }).catch(err => {
                    logger('error', `event.js:16 switch priority() Connect error to MongoDB.`, err);
                    botReply(`Database error, try again later!`, message);
                });

                return blockEventWhileProcessing(false); // unlock
            }

            default: {
                blockEventWhileProcessing(false); // unlock
                logger('error', `event.js:1 switch default() '${userCode}' code passed validation with status:'${codeValidation(userCode).code}' and type:'${codeValidation(userCode).type}'.`);
                return botReply(`Unknown code type, that might be an error. Please, report it to **${config.ownerTag}**\nTimestamp: \`${Date.now()}\``, message);
            }
        }

    } else {
        if (codeValidation(userCode).code === 'invalid_code') botReply(`This code seems to be invalid. Make sure to type it correctly!`, message);
        else if (codeValidation(userCode).code === 'used_code') botReply(`This code is already redeemed by the other member.`, message);
        else botReply(`**Your code could not be redeemed**, invalid code status 🐛\nContact **${config.ownerTag}** to investigate.`, message);
    }
};