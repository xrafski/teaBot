const { botReply, logger, Discord, TEAlogo, embedMessage, sendEmbedLog } = require("../teaBot");
const config = require('../bot-settings.json');
const fs = require('fs');

module.exports.help = {
    name: "scan",
    description: "Scan the entire server to find threat users.",
    type: "serverowner",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message) => {
    const logChannel = message.guild.channels.cache.find(channel => channel.name === config.logs.channelName);
    if (!logChannel) return botReply(embedMessage(`**Log channel is not detected!**\nPlease, create a new channel '**${config.logs.channelName}**' or fix permissions if already exists.\n\nSet the following permissions for the bot:\n✅ Manage Webhooks\n✅ Read Messages\n✅ Send Messages\n✅ Embed Links\n✅ Read Message History\n✅ Use External Emoji`, message.author), message);
    if (message.channel != logChannel) return botReply(`You can use this command **only** in the ${logChannel} channel for secirity reasons.`, message);
    // if (!logChannel.permissionsFor(bot.user).has('MANAGE_WEBHOOKS')) return botReply(`❌ Missing '**Manage Webhooks**' permissions for ${logChannel}.`, message);

    fs.readFile('./cache/blacklist.json', 'utf8', (error, data) => {
        if (error) {
            logger('error', 'scan.js:1 () Load blacklist.json file', error);
            return botReply('Error to parse data, try again later.', message);
        }

        const newData = JSON.parse(data);
        let detectedThreats = '';
        let detectedNumber = 0;

        newData.forEach(threatUser => {
            const { userName, userWarning, userDiscord } = threatUser;
            const formatDiscordID = userDiscord?.replace(/[\\<>@#&!? ]/g, "").split(',');
            if (!formatDiscordID) return;

            formatDiscordID.forEach(threatID => {
                const threatUserObject = checkIfThreatHere(threatID);
                if (threatUserObject) {
                    if (detectedThreats.length <= 1900) {
                        detectedThreats = detectedThreats + `\n${warningEmoji(userWarning)} **${userName}** — ${threatUserObject} ${threatUserObject.tag}`;
                        detectedNumber++;
                    }
                }
            });
        });

        if (detectedNumber > 0) {
            const embed_scan_results = new Discord.MessageEmbed()
                .setColor('#d13400')
                .setAuthor(`${message.guild.name} Scan Results`, TEAlogo)
                .setTitle(`Detected ${detectedNumber} threat(s) in total!`)
                .setDescription(detectedThreats)
                .setTimestamp()
                .setFooter(`Type ${config.botPrefix}check nickname for details.`, TEAlogo)

            sendEmbedLog(embed_scan_results, logChannel.id, config.logs.loggerName)
                .catch(error => {
                    botReply(`${error.info}\n**Reason**: ${error.data.message}`, message);
                    logger('error', `scan.js:2 () ${error.info} in the ${message.guild.name}.`);
                });
        } else {
            const embed_scan_results = new Discord.MessageEmbed()
                .setColor('#55ff42')
                .setAuthor(`${message.guild.name} Scan Results`, TEAlogo)
                .setTitle(`✅ No threats detected!`)
                .setThumbnail(TEAlogo)
                .setTimestamp()

            sendEmbedLog(embed_scan_results, logChannel.id, config.logs.loggerName)
                .catch(error => {
                    if (error.data.message === 'Missing Permissions') {
                        botReply(`Not enough permissions, missing '**Manage Webhooks**' for the ${logChannel} channel.`, message);
                        logger('error', `scan.js:3 () ${error.info} in the ${message.guild.name}.`);
                    } else {
                        botReply(`${error.info}\n**Reason**: ${error.data.message}`, message);
                        logger('error', `scan.js:4 () ${error.info} in the ${message.guild.name}.`);
                    }
                });
        }
    });

    function checkIfThreatHere(userID) {
        const userObject = message.guild.members.cache.get(userID);
        if (userObject) return userObject.user;
        else return undefined;
    }

    function warningEmoji(userWarning) {
        switch (userWarning) {
            case 'g': return '🟢';
            case 'y': return '🟡';
            case 'r': return '🔴';
            case 'b': return '💀';
            default: return '⚪';
        }
    }
}