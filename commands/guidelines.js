const config = require("../bot-settings.json");
const { TEAemoji } = require("../tea");
const fs = require('fs');

module.exports.help = {
    name: "guidelines",
    description: "Auto-update guidelines on all servers at once.",
    type: "administrator",
    usage: `Send an embed message to the guidelines channel using **carl.gg/dashboard** and then type **${config.BotPrefix}updateguidelines** to update guidelines on all servers at once.`
};

module.exports.run = async (bot, message) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                     updateguidelines                                     //
    //////////////////////////////////////////////////////////////////////////////////////////////

    // load certification file and parse to JSON object
    const cert = fs.readFileSync("./certification.json", "utf8");
    const certification = JSON.parse(cert);

    // define channel where embed is stored
    const primaryGuildChannel = await message.guild.channels.cache.find(ch => ch.name === config.GuidelinesChannelName);

    // when primaryGuildChannel is not found
    if (!primaryGuildChannel) return message.reply(`${TEAemoji()} I can't find the channel with a global message to send!\nMake sure the channel has a proper name: **${config.GuidelinesChannelName}**`)
        .then(message => message.delete({ timeout: 15000 })).catch(() => { return });

    // if command sent in the primaryGuildChannel
    if (message.channel === primaryGuildChannel) return message.reply(`${TEAemoji()} You can't use that command in this channel!`)
        .then(message => message.delete({ timeout: 2000 })).catch(() => { return });

    // the bot permissions check
    if (primaryGuildChannel.permissionsFor(message.guild.me).has('READ_MESSAGE_HISTORY')) {
        const primaryGuildChannelFetch = await primaryGuildChannel.messages.fetch({ limit: 1 }).catch(() => { return });

        if (!primaryGuildChannelFetch) return message.reply(`${TEAemoji()} I can't fetch the global message!\nMake sure bot has **READ_MESSAGES** set as **TRUE** on the ${primaryGuildChannel} channel.`)
            .then(message => message.delete({ timeout: 15000 })).catch(() => { return });

        if (!primaryGuildChannelFetch.size) return message.reply(`${TEAemoji()} ${primaryGuildChannel} looks empty to me.\nSend an embed message using **carl.gg/dashboard** to the ${primaryGuildChannel} channel and try again.`)
            .then(message => message.delete({ timeout: 15000 })).catch(() => { return });

        const primaryMessage = primaryGuildChannelFetch.first();
        if (!primaryMessage.embeds[0]) return message.reply(`${TEAemoji()} The bot only supports embeds.\nIt looks like your global message set on the ${primaryGuildChannel} channel is plain text.`)
            .then(message => message.delete({ timeout: 15000 })).catch(() => { return });

        console.warn(`Global guidelines update (${bot.guilds.cache.size} guilds)`);
        // forEach to send/update guidelines
        bot.guilds.cache.forEach((guild) => {
            if (guild.id === config.TEAserverID) return;
            const channel = guild.channels.cache.find(ch => ch.name === config.GuidelinesChannelName);

            if (certification[guild.id]) {
                if (channel) return updateGuildelines(guild, channel, primaryMessage.embeds[0]);
                else return console.error(`🔴 '${guild.name}' (${guild.owner.user.tag}) - No #${config.GuidelinesChannelName} channel found.`);
            } else return;
        });

        return message.reply(`${TEAemoji()} The command has been executed.\nIt may take some time to see the changes across all servers.`)
            .then(message => message.delete({ timeout: 30000 })).catch(() => { return });

    } else return message.reply(`The bot has **READ_MESSAGE_HISTORY** set as **FALSE** on the #${primaryGuildChannel} channel.\nThis permission is required for the command to work.`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    async function updateGuildelines(guild, channel, primaryMessage) {

        if (!channel.permissionsFor(guild.me).has('READ_MESSAGE_HISTORY') || !channel.permissionsFor(guild.me).has('SEND_MESSAGES') || !channel.permissionsFor(guild.me).has('EMBED_LINKS'))
            return console.error(`⭕ '${guild.name}' (${guild.owner.user.tag}) - The bot has READ_MESSAGE_HISTORY or SEND_MESSAGES or EMBED_LINKS set as FALSE on the #${channel.name} channel.`);

        const fetched = await channel.messages.fetch({ limit: 1 }).catch(() => { return console.error(`❌ '${guild.name}' (${guild.owner.user.tag}) - Error to fetch the message - The bot has READ_MESSAGES set as FALSE on the #${channel.name} channel.`) })
        if (fetched) {

            const lastMessage = fetched.first();
            // console.warn(`✅ Detected #${channel.name} (${fetched.size} message fetched) - '${guild.name}'`);

            if (lastMessage && lastMessage.author === bot.user) { // if last message exist and the bot is author

                if (!lastMessage.embeds[0]) { // if lastMessage doesn't have an embed
                    // console.log(`🚓 '${guild.name}' Guideline message is not an embed - I have to remove the previous one and send a new.`);
                    return lastMessage.delete()
                        .then(() => channel.send(primaryMessage))
                        .catch(error => console.error(`Error to send a message on the '${guild.name}'!\n`, error));
                }
                if (lastMessage.embeds[0].footer.text != primaryMessage.footer.text) {
                    // console.log(`📝 '${guild.name}' Guideline message has a different footer - Going to edit and update it.`);
                    return lastMessage.edit(primaryMessage)
                        .catch(error => console.error(`Error to edit the message on the '${guild.name}'`, error));
                } else return; // console.log(`🆗 '${guild.name}' Nothing to change there, guideline message has the latest content.`);

            } else { // else if the bot is not a lastMessage author or message doesnt exist
                // console.log(`🚗 '${guild.name}' Guideline message doesn't exist or not sent by the bot - Sending a new one.`);
                return channel.send(primaryMessage)
                    .catch(error => console.error(`Error to send a message on the '${guild.name}'!\n`, error));
            }
        }
    }
}