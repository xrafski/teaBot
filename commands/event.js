const { botReply, logger, sendEmbedLog, getEmoji, calculatePercentage } = require('../teaBot');
const config = require("../bot-settings.json");
const { checkEventCache, blockEventWhileProcessing, updateEventStatus } = require("../cache/tea-event-cache");
const { MongoClient } = require("../functions/mongodb-connection");
const { eventPriorityPrizeModel } = require("../schema/event-priority-prizes");
const { eventCodeModel } = require('../schema/event-codes');
const { eventRaffleTier0 } = require('../schema/event-raffle-tier0');
const { eventRaffleTier1 } = require('../schema/event-raffle-tier1');
const { eventRaffleTier2 } = require('../schema/event-raffle-tier2');

module.exports.help = {
    name: "event",
    description: "Participate command in the TEA events.",
    type: "public",
    usage: `ℹ️ Format: **${config.botDetails.prefix}event code**\nℹ️ Example(s):\n${config.botDetails.prefix}event asd123zxc\n${config.botDetails.prefix}event remaining`
};

module.exports.run = async (bot, message, args) => {
    // message.delete().catch(err => logger('warn', `event.js:1 () Error to remove the message.`, err));

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
                    botReply(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} ${author} Event Codes Information\n> Event code pool: **${allCodes.length}**\n> Remaining codes: **${availableCodes.length}**\n\n${codeHints ? `Hint(s): ${codeHints}` : ''}`, message);
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

        await eventCodeModel.findOne({ group: { "$in": ["global", guild.id] }, id: userCode, available: true }) // find available document with provided code that is in group 'global' or 'serverID'
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
                        case 'raffle': { // Raffle type of code.
                            message.delete().catch(err => logger('warn', `event.js:1 raffle switch() Error to remove event attempt message.`, err));

                            await AddUserToTier0Basic(author, code).then(async basicEntry => {
                                // console.log(basicEntry);
                                const { amountOfClubCodes, promoteToClubTier, totalUserBasicEntries, currentUserBasicEntries, totalRaffleCodes } = basicEntry;
                                const basicInformation = `> ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Congratulations ${author}, entry has been registered to the **basic tier raffle** successfully! (**${calculatePercentage(totalUserBasicEntries, totalRaffleCodes)}** of available entries found).\n> __**${calculatePercentage(currentUserBasicEntries, amountOfClubCodes)}** of codes for **${code.club}** found so far.__`;

                                if (promoteToClubTier) { // if user is promoted to the club tier raffle.

                                    await AddUserToTier1Club(author, code)
                                        .then(async clubEntry => {
                                            // console.log(clubEntry);
                                            const { amountOfClubs, totalUserClubEntries, promoteToGrandTier } = clubEntry;
                                            const userUpgradedToClubTier = `\n> \`You have found all club codes in ${code.club}!\`\n> _Registered one entry ticket for **club tier raffle**! (**${calculatePercentage(totalUserClubEntries, amountOfClubs)}** of possible entries)._`;
                                            infoString = userUpgradedToClubTier;

                                            if (promoteToGrandTier) { // if user is promoted to the grand tier raffle
                                                await AddUserToTier2Grand(author)
                                                    .then(grandEntry => {
                                                        // console.log(grandEntry);
                                                        const { totalGrandEntries } = grandEntry;
                                                        infoString = basicInformation + userUpgradedToClubTier + `\n\`\`\`less\n[+] You have found all event codes in all clubs!\`\`\`\n> Registered a final entry ticket to the **grand tier raffle** you have around **${calculatePercentage(1, totalGrandEntries)}** chances to win at this moment!\n> **Good Luck**, We really appreciate your work during this event 💙`;
                                                    }).catch(err => {
                                                        logger('error', `event.js:2 raffle switch() MongoDB query error.`, err);
                                                        botReply(`> ${author} ❌ Database error, please try again later.`, message);
                                                    });
                                            } else infoString = basicInformation + userUpgradedToClubTier + `\n\n> Find all the codes in the different club(s) to register another raffle ticket and increase your chances of winning the **club tier raffle**.\n> If you manage to find all event codes in all clubs you will enter the **grand tier raffle**!`;;

                                        }).catch(err => {
                                            logger('error', `event.js:3 raffle switch() MongoDB query error.`, err);
                                            botReply(`> ${author} ❌ Database error, please try again later.`, message);
                                        });

                                } else infoString = basicInformation + `\n\n> Find more codes to increase your chances of winning the **basic tier raffle**, find all **${code.club}** codes to enter the **club tier raffle**!`;

                                botReply(infoString, message); // Send a message with the entry information.

                            }).catch(err => {
                                if (err.code === 11000) botReply(`> ${author} You already in the basic raffle with this code.`, message);
                                else {
                                    logger('error', `event.js:4 raffle switch() MongoDB query error.`, err);
                                    botReply(`> ${author} ❌ Database error, please try again later.`, message);
                                }
                            });

                            // await checkAmountOfDocumentsAndDisableIfZero(); // Check if any available codes left, if so disable the system.
                            return blockEventWhileProcessing(false); // Unlock the command.
                        }
                        default: {
                            logger('error', `event.js:1 default switch() This case not should be fired. (${code.id} | ${code.type})`);
                            return blockEventWhileProcessing(false); // Unlock the command.
                        }
                    }

                } else { // When findOne function didn't find anything.
                    message.delete().catch(err => logger('warn', `event.js:1 code switch() Error to remove event attempt message.`, err));
                    botReply(`> ${author} ❌ Failed to redeem, this code is invalid or already claimed.`, message);
                    blockEventWhileProcessing(false); // unlock the command.
                }

            }).catch(err => {
                // query error to findOne
                logger('error', `event.js:1 switch() Query error to MongoDB.`, err);
                botReply(`Database query error, try again later!`, message);
            });

    }).catch(err => {
        logger('error', `event.js:1 main() Connect error to MongoDB.`, err);
        botReply(`> ${author} Database connection error, try again later!`, message);
    });

    /**
     * A function to check amount of available codes
     * 
     * Disable the system if no available codes are found..
     */
    async function checkAmountOfDocumentsAndDisableIfZero() {
        await eventCodeModel.countDocuments({ available: true })
            .then(async docsAmount => {
                if (docsAmount === 0) {
                    await updateEventStatus(false, (err, res) => {
                        if (err) logger('error', `event.js:1 checkAmountOfDocumentsAndDisableIfZero() Failed.`, err);
                        else logger('log', `event.js:2 checkAmountOfDocumentsAndDisableIfZero() ${res.message}`);
                    });
                }
            }).catch(err => logger('error', `event.js:3 checkAmountOfDocumentsAndDisableIfZero() Query error to MongoDB.`, err));
    }

    /**
    * A function to add a user to tier0 (basic) raffle.
    * @param {Object} user User object with user.id/user.tag etc.
    * @param {Object} code A document Object from MongoDB eventCodeModel query.
    * @returns Objects with a new document, amount of club participants, the current amount of user entries and if user should be promoted to the next tier.
    */
    function AddUserToTier0Basic(user, code) {
        return new Promise(async (resolve, reject) => {

            const newRaffleEntry = new eventRaffleTier0({
                id: user.id,
                tag: user.tag,
                code: code.id,
                club: code.club,
                entry: user.id + '-' + code.id + '-' + code.club
            }); // Create MongoDB document.

            await Promise.all([eventRaffleTier0.create(newRaffleEntry), eventCodeModel.find({ type: 'raffle', club: code.club })])
                .then(async ([entryDoc, amountOfClubCodes]) => {
                    const currentUserBasicEntries = await eventRaffleTier0.find({ id: user.id, club: code.club }).catch(reject);
                    const totalUserBasicEntries = await eventRaffleTier0.find({ id: user.id }).catch(reject);
                    const totalRaffleCodes = await eventCodeModel.find({ type: 'raffle' }).catch(reject);

                    let promoteToClubTier = false;
                    if (amountOfClubCodes.length === currentUserBasicEntries.length) promoteToClubTier = true;

                    resolve({ basicEntryDoc: entryDoc._doc, amountOfClubCodes: amountOfClubCodes.length, currentUserBasicEntries: currentUserBasicEntries.length, totalUserBasicEntries: totalUserBasicEntries.length, totalRaffleCodes: totalRaffleCodes.length, promoteToClubTier });
                }).catch(reject);
        });
    }

    /**
    * A function to add a user to tier1 (club) raffle.
    * @param {Object} user User Object with user.id/user.tag etc.
    * @param {Object} code A document Object from MongoDB eventCodeModel query.
    * @returns Objects with a new document, amount of clubs and the current amount of user entries.
    */
    function AddUserToTier1Club(user, code) {
        return new Promise(async (resolve, reject) => {

            const newRaffleEntry = new eventRaffleTier0({
                id: user.id,
                tag: user.tag,
                club: code.club,
                entry: user.id + '-' + code.club
            }); // Create MongoDB document.


            await Promise.all([eventRaffleTier1.create(newRaffleEntry), eventCodeModel.distinct("club", { "club": { $nin: ["", null] } })])
                .then(async ([entryDoc, amountOfClubs]) => {

                    const totalUserClubEntries = await eventRaffleTier1.find({ id: user.id }).catch(reject);

                    let promoteToGrandTier = false;
                    if (totalUserClubEntries.length === amountOfClubs.length) promoteToGrandTier = true;

                    resolve({ clubEntryDoc: entryDoc._doc, amountOfClubs: amountOfClubs.length, totalUserClubEntries: totalUserClubEntries.length, promoteToGrandTier });
                }).catch(reject);
        });
    }

    /**
    * A function to add a user to tier2 (top) raffle.
    * @param {Object} user User Object with user.id/user.tag etc.
    * @returns Object with a new document.
    */
    function AddUserToTier2Grand(user) {
        return new Promise(async (resolve, reject) => {

            const newRaffleEntry = new eventRaffleTier0({
                id: user.id,
                tag: user.tag,
                entry: user.id + '-grand'
            }); // Create MongoDB document.

            await eventRaffleTier2.create(newRaffleEntry)
                .then(async newEntryDoc => {
                    const totalGrandEntries = await eventRaffleTier2.countDocuments().catch(reject);
                    resolve({ grandEntryDoc: newEntryDoc._doc, totalGrandEntries })
                }).catch(reject);
        });
    }
};