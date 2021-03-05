const config = require("../bot-settings.json");
const { addCode, checkEventCache, delCode, checkEventStatus, setEventStatus, codeDetails } = require("../cache/tea-events");
const { botReply, logger, Discord, TEAlogo } = require('../teaBot');

module.exports.help = {
    name: "code",
    description: "Manage codes for event system.",
    type: "administrator",
    usage: `ℹ️ Format: multiple formats (check examples below)\nℹ️ Example(s):\n${config.prefixPlaceholder}code add -codeName -ItemName -HintText -redeemableCode(optional)\n${config.prefixPlaceholder}code del -codeName\n${config.prefixPlaceholder}code check -codeName\n${config.prefixPlaceholder}code status\n${config.prefixPlaceholder}code enable\n${config.prefixPlaceholder}code disable`
};

module.exports.run = async (bot, message, args, prefix) => {
    const codeRequest = args.join(' ').trim().split(' -');
    const [codeType, userCode, itemName, codeHint, redeemCode] = codeRequest;
    const { author } = message;

    switch (codeType?.toLowerCase()) {
        case 'status': return botReply(`Event status: ${(checkEventStatus().status === true ? `**Enabled**` : `**Disabled**`)}`, message);
        case 'enable': {
            return await setEventStatus(true, (err, res) => {
                if (err) {
                    logger('error', `code.js:1 () ${err}`);
                    return botReply('Database error, try again later!', message);
                }
                logger('log', `code.js:2 () ${res.message}`);
                botReply(`Event commands (${prefix}claim, ${prefix}event) are now **enabled**.`, message);
            });
        }
        case 'disable': {
            return await setEventStatus(false, (err, res) => {
                if (err) {
                    logger('error', `code.js:3 () ${err}`);
                    return botReply('Database error, try again later!', message);
                }
                logger('log', `code.js:4 () ${res.message}`);
                botReply(`Event commands (${prefix}claim, ${prefix}event) are now **disabled**.`, message);
            });
        }
        case 'add': {
            return await addCode(userCode, itemName, codeHint, redeemCode, (err, res) => {
                if (err) {
                    if (err.code === 11000) botReply(`'**${userCode}**' code already exists in the database!`, message);
                    else if (err?.message === 'codeStr or itemName is not suppled for addCode() function') botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
                    else botReply(`Database error ;(`, message);
                    return logger('error', `code.js:5 () Error to add '${userCode}' code to the 'event' collection.`, err);
                }
                logger('log', `code.js:6 () '${author.tag}' ${res.message}`);
                botReply(`A new code has been added!\nID: \`${res.doc.id}\`\nItem Name: \`${res.doc.prize.item}\`\nHint: \`${res.doc.hint}\`\nCode redeemable on the glyph page? \`${res.doc.prize.code ? `YES: '${res.doc.prize.code}'` : `NO`}\`\n\nPlease type **${prefix}code del -${res.doc.id}** if you made a mistake and want to delete this code.`, message);
            });
        }
        case 'del': {
            return await delCode(userCode, (err, res) => {
                if (err) {
                    logger('error', `code.js:7 () ${err.message}`);
                    return botReply(`${err.message}`, message);
                }

                botReply(`${res.message}`, message);
                logger('log', `code.js:8 ()'${author.tag}' removed document assigned to '${res.deletedDoc.id}' code.`);
            });
        }
        case 'check': {
            if (!userCode) return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
            return codeDetails(userCode, (err, res) => {
                if (err) return botReply(`Error to check the code!\n${err}`, message);
                const code = res.doc;

                const embed_code_details = new Discord.MessageEmbed()
                    .setColor(code.available ? 'GREEN' : 'RED')
                    .setTitle(`Event code ID: '${code.id}'`)
                    .setAuthor(res.message, TEAlogo)
                    .addFields(
                        { name: `General information:`, value: `**Available status**: ${code.available.toString().toUpperCase()}\n**Hint**: ${code.hint ? code.hint : `No hint found`}`, inline: false },
                        { name: `Prize Information:`, value: `**Item name**: ${code.prize.item}\n${code.prize.code}\n**Claimed status**: ${code.prize.claimed ? `TRUE\n**userID**: ${code.prize.userID}\n**userTag**: ${code.prize.userTag}` : `FALSE`}`, inline: false }
                    )
                    .setFooter(`Type: '${prefix}code del -${code.id}' to delete this code.`, TEAlogo)
                    .setThumbnail(TEAlogo)
                botReply(embed_code_details, message);
            });
        }
        default: {
            if (config.botDebug) console.log({ message: 'code.js eventCache Object', eventCache: checkEventCache(), eventStatus: checkEventStatus() });
            return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
        }
    }
}