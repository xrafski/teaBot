const config = require("../bot-settings.json");
const { claimValidation, updateCode, codeDetails, checkEventStatus } = require("../cache/tea-events");
const { botReply, logger, sendEmbedLog } = require("../teaBot");

module.exports.help = {
    name: "claim",
    description: "Re-claim a prize for redeemed codes.",
    type: "public",
    usage: `ℹ️ Format: **${config.prefixPlaceholder}claim code**\nℹ️ Example(s):\n${config.prefixPlaceholder}claim asd123zxc`
};

module.exports.run = async (bot, message, args, prefix) => {
    if (checkEventStatus().status === false) return botReply(`There is no active event to participate!`, message);

    const [userCode] = args;
    const { author } = message;
    if (!userCode) return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);

    if (claimValidation(userCode, author).code === 'correct_claim_request') {

        codeDetails(userCode, async (err, code) => {
            if (err) {
                logger('error', `claim.js:1 () Error to load '${userCode}' document details.`, err);
                return botReply(`Database error, try again later ;(`, message);
            }

            if (code.doc.prize.code) {
                author.send(`Congratulations, you have won: **${code.doc.prize.item}**!\nThis is **redeemable code** on the Trion Worlds page (<https://www.trionworlds.com/trove/en/store/redeem/>)\n\nUse this code to redeem your prize: **${code.doc.prize.code}**`)
                    .then(async dmMsg => {
                        if (dmMsg) {
                            botReply(`Congratulations, you have won: **${code.doc.prize.item}**!\nPlease, check your Direct Messages for details 😜`, message);
                            logger('event', `claim.js:2 () User: '${author.tag}'(${author.id}) has received a DM with a redeemable code behind '${code.doc.id}' code.`)
                            await updateCode(userCode, { "$set": { 'prize.claimed': true } }, (err, resClaimed) => {
                                if (err) {
                                    botReply(`Failed to update code information, please type '**${prefix}claim ${userCode}**' to confirm that you received DM with the code.`, message);
                                    return logger('error', `claim.js:3 () Error to update code details`, err);
                                }
                                logger('event', `claim.js:4 () Document for the '${resClaimed.doc.id}' code updated prize status as claimed.`);
                                sendEmbedLog(`<@${resClaimed.doc.prize.userID}> - ${resClaimed.doc.prize.userTag} - ${resClaimed.doc.prize.userID}\nUser has claimed **${resClaimed.doc.prize.item}** using **${resClaimed.doc.id}** code.`, config.eventLogs.channelID, config.eventLogs.loggerName)
                                    .catch(err => logger('error', 'claim.js:5 () Error to send embed log.', err));
                            });
                        } else logger('warn', `claim.js:6 () Direct Message has been sent but not received? Anyway, we should send a redeem code that is behind '${code.doc.id}' code again to the '${author.tag}'(${author.id}) user.`)
                    })
                    .catch(err => {
                        logger('error', `claim.js:7 () Error to send DM to '${author.tag}'(${author.id}).`, err);
                        botReply(`There was an error to send you a direct message **again**, make sure your DMs are not disabled in privacy settings.\nType **${prefix}claim ${userCode}** to re-send the prize!`, message);
                    });

            } else {
                await updateCode(userCode, { "$set": { 'prize.claimed': true } }, (err, resClaimed) => {
                    if (err) {
                        botReply(`Failed to update code information, please type '**${prefix}claim ${userCode}**' later.`, message);
                        return logger('error', `claim.js:8 () Error to update code details`, err);
                    }
                    logger('event', `claim.js:9 () User: '${resClaimed.doc.prize.userTag}'(${resClaimed.doc.prize.userID}) has claimed prize behind '${resClaimed.doc.id}' code.`);
                    botReply(`Congratulations, you have won: **${resClaimed.doc.prize.item}**!\nNon-code prizes require an in-game trade with our staff members, so we will try to contact you after the event 😎`, message);
                    sendEmbedLog(`<@${resClaimed.doc.prize.userID}> - ${resClaimed.doc.prize.userTag} - ${resClaimed.doc.prize.userID}\nUser has claimed **${resClaimed.doc.prize.item}** using **${resClaimed.doc.id}** code.`, config.eventLogs.channelID, config.eventLogs.loggerName)
                        .catch(err => logger('error', 'claim.js:10 () Error to send embed log.', err));
                });
            }
        });

    } else botReply(`Invalid or already claimed request, make sure to type the code correctly.\nIf you are trying to claim a code you found in any club type **${prefix}event yourCode** instead.`, message);
}