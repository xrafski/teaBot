const config = require("../bot-settings.json");
const { addCode, checkEventCache, delCode, checkEventStatus, setEventStatus } = require("../cache/tea-events");
const { botReply, logger } = require('../teaBot');

module.exports.help = {
    name: "code",
    description: "Manage codes for event system.",
    type: "administrator",
    usage: `ℹ️ Format: multiple formats (check examples below)\nℹ️ Example(s):\n${config.prefixPlaceholder}code add -codeName -ItemName -redeemableCode(optional)\n${config.prefixPlaceholder}code del -codeName\n${config.prefixPlaceholder}code status\n${config.prefixPlaceholder}code enable\n${config.prefixPlaceholder}code disable`
};

module.exports.run = async (bot, message, args, prefix) => {
    const codeRequest = args.join(' ').trim().split(' -');
    const [codeType, userCode, itemName, redeemCode] = codeRequest;
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
            return await addCode(userCode, itemName, redeemCode, (err, res) => {
                if (err) {
                    if (err.code === 11000) botReply(`'**${userCode}**' code already exists in the database!`, message);
                    else botReply(`Database error ;(`, message);
                    return logger('error', `code.js:5 () Error to add '${userCode}' code to the 'event' collection.`, err);
                }
                logger('info', `code.js:6 () '${author.tag}' ${res.message}`);
                botReply(`A new code has been added!\nID: \`${res.doc.id}\`\nItem Name: \`${res.doc.prize.item}\`\nCode redeemable on the glyph page? \`${res.doc.prize.code ? `YES: '${res.doc.prize.code}'` : `NO`}\`\n\nPlease type **${prefix}code del -${res.doc.id}** if you made a mistake to delate this code.`, message);
            });
        }
        case 'del': {
            return await delCode(userCode, (err, res) => {
                if (err) return console.log(err);

                botReply(`${res.message}`, message);
                logger('log', `code.js:7 ()'${author.tag}' removed document assigned to '${res.deletedDoc.id}' code.`);
            });
        }
        default: {
            if (config.botDebug) console.log({ message: 'code.js eventCache Object', eventCache: checkEventCache(), eventStatus: checkEventStatus() });
            return botReply(`Wrong command format, type **${prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
        }
    }
}