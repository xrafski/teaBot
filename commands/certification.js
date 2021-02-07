const config = require("../bot-settings.json");
const { getEmoji, botReply, embedMessage, TEAlogo, Discord, logger } = require("../teaBot");
const fs = require('fs');

module.exports.help = {
    name: "certification",
    description: "Check if this club is certified TEA member.",
    type: "public",
    usage: `ℹ️ Format: **${config.botPrefix}certification** details(optional)`
};

module.exports.run = async (bot, message, args) => {
    return fs.readFile('./cache/certification.json', 'utf8', (error, data) => {
        if (error) {
            logger('error', 'certification.js:1 () Load file', error);
            return botReply('❌ Error to parse the data, try again later.', message);
        }
        if (args[0] === 'details') {
            if (JSON.parse(data).find(club => club.guildDiscordID === message.guild.id)) {
                const { guildDiscordID, guildName, guildDescription, guildRequirements, guildRepresentative } = JSON.parse(data).find(club => club.guildDiscordID === `${message.guild.id}`);
                let { guildDiscordLink, guildJoinworld } = JSON.parse(data).find(club => club.guildDiscordID === `${message.guild.id}`);
                const embed_certification_details = new Discord.MessageEmbed()
                    .setColor('#fcec03')
                    .setAuthor(`Certification Details`, TEAlogo)
                    .setTitle(`${message.guild.name} ${getEmoji(config.TEAserverID, 'verified')}`)
                    .setDescription(`**Club Name:** ${guildName}\n**Representative:** ${guildRepresentative}\n**In-game club world:** ${guildJoinworld = (guildJoinworld ? `\`/joinworld ${guildJoinworld?.toLowerCase()}\`` : 'Data is not provided')}\n**Discord Invite:** ${guildDiscordLink = guildDiscordLink || "Club has not provided a link"}\n**Discord Server ID:** ${guildDiscordID}`)
                    .addFields(
                        { name: 'Description', value: guildDescription, inline: false },
                        { name: 'Requirements', value: guildRequirements, inline: false },
                    )
                    .setThumbnail(message.guild.iconURL())
                    .setFooter('Contact TEA Spreadsheet Manager if the data is outdated!')
                    .setTimestamp()
                botReply(embed_certification_details, message)
                // .then(msg => messageRemoverWithReact(msg, message.author));

            } else return printResultsMessage(null);
        } else if (JSON.parse(data).find(club => club.guildDiscordID === message.guild.id)) {
            return printResultsMessage(message.guild.id);
        } else return printResultsMessage(null);
    });

    function printResultsMessage(guildID) {
        switch (guildID) {
            case config.TEAserverID: return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'verified')} **${message.guild.name}** is a primary server of the ${getEmoji(config.TEAserverID, 'TEA')} Trove Ethics Alliance.`, message.author), message);
            case undefined: return botReply(embedMessage(`❌ This club is not a certified member of the ${getEmoji(config.TEAserverID, 'TEA')} **Trove Ethics Alliance**`, message.author), message);
            default: return botReply(embedMessage(`${getEmoji(config.TEAserverID, 'verified')} **${message.guild.name}** is a certified member of the ${getEmoji(config.TEAserverID, 'TEA')} Trove Ethics Alliance.`, message.author), message);
        }
    }
}