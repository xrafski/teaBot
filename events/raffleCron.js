const { bot, logger, getEmoji, calculatePercentage } = require('../teaBot');
const config = require("../bot-settings.json");
const cron = require('node-cron');
const { MongoClient } = require('../functions/mongodb-connection');
const { eventSettingsModel } = require('../schema/event-settings');
const { checkEventCache, updateEventStatus } = require('../cache/tea-event-cache');
const { eventRaffleTier0 } = require('../schema/event-raffle-tier0');
const { eventRaffleTier1 } = require('../schema/event-raffle-tier1');
const { eventRaffleTier2 } = require('../schema/event-raffle-tier2');
const { eventCodeModel } = require('../schema/event-codes');

bot.on('ready', () => { // https://crontab.guru/examples.html

    cron.schedule('*/30 * * * *', async () => { // Run raffle check status every 30 minutes.
        if (checkEventCache('eventstatus') === false) return logger('debug', `raffleCron.js:0 Event cache status is set to false which means that event is disabled.`);
        await checkRaffleEndTime(); // Check if event should be disabled.
    });


    /**
     * A function to try match date from event settings raffleEndAt with the current time.
     */
    async function checkRaffleEndTime() {

        await MongoClient().then(async () => {

            await eventSettingsModel.findOne({ id: 'event-status' })
                .then(async settingDoc => {
                    if (!settingDoc) return logger('error', `raffleCron.js:1 checkRaffleEndTime() Event settings document is not found.`);
                    // console.log(settingDoc.raffleEndAt);
                    const dateDoc = new Date(settingDoc.raffleEndAt);
                    if (settingDoc.raffleEndAt === '0') return; // Disable the module if data is zero.

                    if (dateDoc.getTime() <= Date.now()) { // When raffle should end.
                        await updateEventStatus(false, async (err, res) => {
                            if (err) logger('error', `raffleCron.js:1 updateEventStatus() Failed.`, err);
                            else {
                                logger('update', `raffleCron.js:2 updateEventStatus() Raffle ended and ${res.message}`);
                                await updateRaffleInfoMessage(null, true); // Update raffle message data and pick winners.
                            }
                        });

                    } else await updateRaffleInfoMessage(); // Just update raffle message data.
                }).catch(err => logger('error', `raffleCron.js:2 checkRaffleEndTime() MongoDB query error.`, err));

        }).catch(err => logger('error', `raffleCron.js:3 checkRaffleEndTime() MongoDB connection error.`, err));
    }

    async function updateRaffleInfoMessage(msgcnt, winMsg) {

        await MongoClient().then(async () => {

            await Promise.all([eventRaffleTier0.countDocuments(), eventRaffleTier1.countDocuments(), eventRaffleTier2.countDocuments(), eventSettingsModel.findOne({ id: 'event-status' }), eventCodeModel.distinct("club"), eventCodeModel.countDocuments({ available: true, type: 'raffle' })])
                .then(async ([tier0, tier1, tier2, eventDoc, uniqClubs, amountOfCodes]) => {
                    // console.log(tier0, tier1, tier2, eventDoc.raffleMessageID, uniqClubs);

                    const raffleMessage = await bot.guilds.cache.get(config.servers.eventServerID)?.channels.cache.get(config.channels.raffleInfoChannelID)?.messages.fetch(eventDoc.raffleMessageID).catch(err => logger('warn', `raffleCron.js:1 Promise.all() Failed to get raffleMessage Object`, err));
                    if (raffleMessage) {
                        let messageContent = `${getEmoji(config.botDetails.TEAserverID, 'TEA')} Event Raffle Information:\n\n\`\`\`cs\n[${tier0}]x Basic Tier Raffle Entries (up to ${calculatePercentage(amountOfCodes, tier0)} to win)\`\`\`\n\`\`\`css\n[${tier1}]x Club Tier Raffle Entries (up to ${calculatePercentage(uniqClubs.length, tier1)} to win)\`\`\`\n\`\`\`less\n[${tier2}]x Grand Prize Tier Raffle Entries (${calculatePercentage(1, tier2)} to win)\`\`\``;

                        if (winMsg) {
                            await Promise.all([eventRaffleTier0.aggregate([{ $sample: { size: Math.round(amountOfCodes) } }]), eventRaffleTier1.aggregate([{ $sample: { size: uniqClubs.length } }]), eventRaffleTier2.aggregate([{ $sample: { size: 1 } }])])
                                .then(async ([winnersT0, winnersT1, winnersT2]) => {
                                    // console.log(winnersT0, winnersT1, winnersT2);
                                    messageContent = messageContent + `\n\n**The event has ended and there is a list of winners.**\n\nBasic Tier Winners: ${winnersToString(winnersT0)}\n\nClub Tier Winners: ${winnersToString(winnersT1)}\n\nGrand Raffle Winner: ${winnersToString(winnersT2)}`;

                                    function winnersToString(winners) {
                                        let number = 0;
                                        let winnerStr = ``;
                                        winners.forEach(winner => {
                                            number++;
                                            winnerStr = winnerStr + `\n${number}. **•** <@${winner.id}>`;
                                        });
                                        return winnerStr ? winnerStr : `\n**•** None`;
                                    }

                                    await disableRaffleDate(); // Disable raffle module.

                                }).catch(err => logger('error', `raffleCron.js:2 Promise.all() Error with promise all function.`, err));

                        }
                        raffleMessage.edit(msgcnt ? msgcnt : messageContent).then(msg => logger('debug', `raffleCron.js:0 Promise.all() Raffle info message has been modified (${msg.content.length}).`)).catch(err => logger('warn', `raffleCron.js:3 Promise.all() Failed to edit raffleMessage`, err));
                    }

                }).catch(err => logger('error', `raffleCron.js:4 Promise.all() MongoDB query error.`, err));

        }).catch(err => logger('error', `raffleCron.js:1 updateRaffleInfoMessage() MongoDB connection error.`, err));
    }

    async function disableRaffleDate() {
        await eventSettingsModel.findOne({ id: 'event-status' })
            .then(settingDoc => {
                if (!settingDoc) return logger('error', `raffleCron.js:1 disableRaffleDate() Document with settings is missing`);

                settingDoc.raffleEndAt = '0'; // Update raffleEndAt with provided data YYYY-MM-DD.
                settingDoc.save().catch(err => logger('error', `raffleCron.js:2 disableRaffleDate() MongoDB save error.`, err)); // Save the document.

            }).catch(err => logger('error', `raffleCron.js:3 disableRaffleDate() MongoDB query error.`, err));
    }
});