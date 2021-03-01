const config = require("../bot-settings.json");
const { codeValidation, updateCode, checkEventStatus, remainingCodes } = require("../cache/tea-events");
const { botReply, logger, sendEmbedLog, getEmoji } = require('../teaBot');

module.exports.help = {
    name: "event",
    description: "Participate command in the TEA events.",
    type: "public",
    usage: `ℹ️ Format: **${config.prefixPlaceholder}event code**\nℹ️ Example(s):\n${config.prefixPlaceholder}event asd123zxc\n${config.prefixPlaceholder}event remaining`
};

module.exports.run = async (bot, message, args, prefix) => {
    if (checkEventStatus().status === false) return botReply(`There is no active event to participate!`, message);

    if (!args.length) return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
    const { author } = message;
    const [userCode] = args;

    if (userCode.toLowerCase() === 'remaining') return botReply(`${getEmoji(config.TEAserverID, 'TEA')} Event Codes Information\nEvent code pool: **${remainingCodes().totalCodes}**\nRemaining codes: **${remainingCodes().availableCodes}**`, message);

    if (codeValidation(userCode).code === 'correct_code') { // check if code is correct
        logger('event', `event.js:1 () '${userCode}' code passed validation with 'correct_code' status.`);

        await updateCode(userCode, { "$set": { 'available': false, 'prize.userID': author.id, 'prize.userTag': author.tag } }, async (err, resAssign) => { // update code information with the updateData
            if (err) {
                botReply('Failed to update code information, try again later ;(', message);
                return logger('error', `event.js:2 () Error to update code details`, err);
            }
            logger('event', `event.js:3 () Assigned '${resAssign.doc.prize.userTag}'(${resAssign.doc.prize.userID}) and ${resAssign.message}`);

            if (resAssign.doc.prize.code) { // if prize is redeemable code
                author.send(`Congratulations, you have won: **${resAssign.doc.prize.item}**!\nThis is **redeemable code** on the Trion Worlds page (<https://www.trionworlds.com/trove/en/store/redeem/>)\n\nUse this code to redeem your prize: **${resAssign.doc.prize.code}**`)
                    .then(async dmMsg => {
                        if (dmMsg) {
                            botReply(`Congratulations, you have won: **${resAssign.doc.prize.item}**!\nPlease, check your Direct Messages for details 😜`, message);
                            logger('event', `event.js:4 () User: '${author.tag}'(${author.id}) has received a DM with a redeemable code behind '${resAssign.doc.id}' code.`)
                            await updateCode(userCode, { "$set": { 'prize.claimed': true } }, (err, resClaimed) => {
                                if (err) {
                                    botReply(`Failed to update code information, please type '**${prefix}claim ${userCode}**' to confirm that you received DM with the code.`, message);
                                    return logger('error', `event.js:5 () Error to update code details`, err);
                                }
                                logger('event', `event.js:6 () Updated document for the '${resClaimed.doc.id}' code, set prize status as claimed.`);
                                sendEmbedLog(`<@${resClaimed.doc.prize.userID}> - ${resClaimed.doc.prize.userTag} - ${resClaimed.doc.prize.userID}\nUser has claimed **${resClaimed.doc.prize.item}** using **${resClaimed.doc.id}** code.`, config.eventLogs.channelID, config.eventLogs.loggerName)
                                    .catch(err => logger('error', 'event.js:7 () Error to send embed log.', err));
                            });
                        } else logger('warn', `event.js:8 () Direct Message has been sent but not received? Anyway, we should send a redeem code that is behind '${resAssign.doc.id}' code again to the '${author.tag}'(${author.id}) user.`)
                    })
                    .catch(err => {
                        logger('error', `event.js:9 () Error to send DM to '${author.tag}'(${author.id}).`, err);
                        botReply(`There was an error to send you a direct message, make sure your DMs are not disabled in privacy settings.\nType **${prefix}claim ${userCode}** to re-send the prize!`, message);
                    });

            } else { // if prize is a trade-required item
                await updateCode(userCode, { "$set": { 'prize.claimed': true } }, (err, resClaimed) => {
                    if (err) {
                        botReply(`Failed to update code information, please type '**${prefix}claim ${userCode}**' later.`, message);
                        return logger('error', `event.js:10 () Error to update code details`, err);
                    }
                    logger('event', `event.js:11 User: '${resClaimed.doc.prize.userTag}'(${resClaimed.doc.prize.userID}) has claimed prize behind '${resClaimed.doc.id}' code.`);
                    botReply(`Congratulations, you have won: **${resClaimed.doc.prize.item}**!\nNon-code prizes require an in-game trade with our staff members, so we will try to contact you after the event ;)`, message);
                    sendEmbedLog(`<@${resClaimed.doc.prize.userID}> - ${resClaimed.doc.prize.userTag} - ${resClaimed.doc.prize.userID}\nUser has claimed **${resClaimed.doc.prize.item}** using **${resClaimed.doc.id}** code.`, config.eventLogs.channelID, config.eventLogs.loggerName)
                        .catch(err => logger('error', 'event.js:12 () Error to send embed log.', err));
                });
            }
        });

    } else { // if code status is something else than 'correct_code'
        switch (codeValidation(userCode).code) {
            case 'invalid_code': return botReply(`**Your code could not be redeemed**, invalid code 😉`, message);
            case 'used_code': return botReply(`**Your code could not be redeemed**, this code is already redeemed 😭`, message);
            default: return botReply(`**Your code could not be redeemed**, invalid or already redeemed 🐛`, message);
        }
    }
}