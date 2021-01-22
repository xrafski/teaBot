const config = require("../bot-settings.json");
const { mysqlQuery } = require("../functions/mysqlTools");
const { getEmoji, botReply, embedMessage, TEAlogo, Discord } = require("../teaBot");

module.exports.help = {
    name: "certification",
    description: "Shows if the guild is a certified TEA member.",
    type: "public",
    usage: `**${config.BotPrefix}certification** details(optional)`
};

module.exports.run = async (bot, message, args) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           cert                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args[0] === 'details') {
        return mysqlQuery(`SELECT * FROM certification_table WHERE guildDiscordID=${message.guild.id}`)
            .then(results => {
                if (results.length === 0) return printResultsMessage(undefined);

                const embed_certification_details = new Discord.MessageEmbed()
                    .setColor('#fcec03')
                    .setAuthor(`Certification Details`, TEAlogo)
                    .setTitle(`${message.guild.name} ${getEmoji(config.TEAserverID, 'verified')}`)
                    .setDescription(`**Club Name:** ${results[0].guildName}\n**Representative:** ${results[0].guildRepresentative}\n**In-game Joinworld:** ${results[0].guildJoinworld}\n**Discord Invite:** ${results[0].guildDiscordLink}\n**DiscordID:** ${results[0].guildDiscordID}`)
                    .addFields(
                        { name: 'Description', value: results[0].guildDescription, inline: false },
                        { name: 'Requirements', value: results[0].guildRequirements, inline: false },
                    )
                    .setThumbnail(message.guild.iconURL())
                    .setFooter('Contact TEA Spreadsheet Manager if data is outdated!')
                    .setTimestamp()
                botReply(embed_certification_details, message, 30000, false, false, false);
            })
            .catch(error => console.error(`certification.js:1 mysqlQuery error`, error));
    } else {
        return mysqlQuery(`SELECT * FROM certification_table WHERE guildDiscordID=${message.guild.id}`)
            .then(results => {
                if (results.length != 0) return printResultsMessage(results[0].guildDiscordID);
                else return printResultsMessage(undefined);
            })
            .catch(error => console.error(`certification.js:1 mysqlQuery error: ${error.code}`));
    }

    function printResultsMessage(guildID) {
        const TEAemoji = getEmoji(config.TEAserverID, 'TEA');
        const TEAverified = getEmoji(config.TEAserverID, 'verified');

        switch (guildID) {
            case config.TEAserverID: return botReply(embedMessage(`${TEAverified} **${message.guild.name}** is a primary server of the ${TEAemoji} Trove Ethics Alliance.`, message.author), message, 15000, true, false, false);
            case undefined: return botReply(embedMessage(`❌ This club is not a certified member of the ${TEAemoji} **Trove Ethics Alliance**`, message.author), message, 15000, true, false, false);
            default: return botReply(embedMessage(`${TEAverified} **${message.guild.name}** is a certified member of the ${TEAemoji} Trove Ethics Alliance.`, message.author), message, 15000, true, false, false)
        }
    }
}