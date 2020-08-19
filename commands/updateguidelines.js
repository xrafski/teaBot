const config = require("../bot-settings.json");

module.exports.help = {
    name: "updateguidelines",
    description: "Auto-update guidelines on all servers at once.",
    type: "disabled",
    usage: `Send an embed message to the guidelines channel using **carl.gg/dashboard** and then type **${config.BotPrefix}updateguidelines** to update guidelines on all servers at once.`
};

module.exports.run = async (bot, message) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                     updateguidelines                                     //
    //////////////////////////////////////////////////////////////////////////////////////////////

    // define channel where embed will be stored
    const primaryGuildChannel = await message.guild.channels.cache.find(ch => ch.name === config.GuidelinesChannelName);

    if (!primaryGuildChannel) return message.reply(`I can't find the channel with a global message to send!\nMake sure the channel has a proper name: **${config.GuidelinesChannelName}**`)
        .then(message => message.delete({ timeout: 15000 })).catch(() => { return });

    if (message.channel === primaryGuildChannel) return message.reply(`You can't use that command in this channel!`)
        .then(message => message.delete({ timeout: 3000 })).catch(() => { return });

    if (primaryGuildChannel.permissionsFor(message.guild.me).has('READ_MESSAGE_HISTORY')) {
        const primaryGuildChannelFetch = await primaryGuildChannel.messages.fetch({ limit: 1 }).catch(() => { return });

        if (!primaryGuildChannelFetch) return message.reply(`I can't fetch the global message!\nMake sure bot has **READ_MESSAGES** set as **TRUE** on the ${primaryGuildChannel} channel.`)
            .then(message => message.delete({ timeout: 15000 })).catch(() => { return });

        if (!primaryGuildChannelFetch.size) return message.reply(`${primaryGuildChannel} looks empty to me.\nSend an embed message using **carl.gg/dashboard** to the ${primaryGuildChannel} channel and try again.`)
            .then(message => message.delete({ timeout: 15000 })).catch(() => { return });

        const primaryMessage = primaryGuildChannelFetch.first();
        if (!primaryMessage.embeds[0]) return message.reply(`The bot only supports embeds.\nIt looks like your global message set on the ${primaryGuildChannel} channel is plain text.`)
            .then(message => message.delete({ timeout: 15000 })).catch(() => { return });


        console.error(`Amount of guilds: ${bot.guilds.cache.size}`);
        // console.log(primaryMessage);
        bot.guilds.cache.forEach((guild) => {
            const channel = guild.channels.cache.find(ch => ch.name === config.GuidelinesChannelName);
            if (channel) updateGuildelines(guild, channel, primaryMessage.embeds[0]);
            else console.error(`🔴 '${guild.name}' (${guild.owner.user.tag}) - No #${config.GuidelinesChannelName} channel found.`);
        });

        const TEAemoji = message.guild.emojis.cache.find(emoji => emoji.name === 'TEA');

        if (TEAemoji) return message.reply(`${TEAemoji} The command has been executed.\nIt may take some time to see the changes across all servers.`)
            .then(message => message.delete({ timeout: 30000 })).catch(() => { return });
        else return message.reply(`🍵 The command has been executed.\nIt may take some time to see the changes across all servers.`)
            .then(message => message.delete({ timeout: 30000 })).catch(() => { return });

    } else return message.reply(`The bot has **READ_MESSAGE_HISTORY** set as **FALSE** on the #${primaryGuildChannel} channel.\nThis permission is required for the command to work.`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    async function updateGuildelines(guild, channel, primaryMessage) {

        if (!channel.permissionsFor(guild.me).has('READ_MESSAGE_HISTORY') || !channel.permissionsFor(guild.me).has('SEND_MESSAGES') || !channel.permissionsFor(guild.me).has('EMBED_LINKS'))
            return console.error(`⭕ '${guild.name}' (${guild.owner.user.tag}) - The bot has READ_MESSAGE_HISTORY or SEND_MESSAGES or EMBED_LINKS set as FALSE on the #${channel.name} channel.`);


        const fetched = await channel.messages.fetch({ limit: 1 }).catch(() => { return console.error(`❌ '${guild.name}' (${guild.owner.user.tag}) - Error to fetch the message - The bot has READ_MESSAGES set as FALSE on the #${channel.name} channel.`) })
        if (fetched) {

            const lastMessage = fetched.first();
            console.warn(`✅ Detected #${channel.name} (${fetched.size} message fetched) - '${guild.name}'`);

            if (lastMessage && lastMessage.author === bot.user) { // if last message exist and the bot is author

                if (!lastMessage.embeds[0]) { // if lastMessage doesn't have an embed
                    lastMessage.delete();
                    channel.send(primaryMessage);
                    return console.log(`🚓 Guideline message is not an embed - I have to remove the previous one and send a new.`);
                }

                if (lastMessage.embeds[0].timestamp != primaryMessage.timestamp) {
                    lastMessage.edit(primaryMessage);
                    return console.log(`📝 Guideline message has a different timestamp - Going to edit and update it.`);
                } else { console.log(`🆗 Nothing to change there, guideline message has the latest content.`) }


            } else { // else if the bot is not a lastMessage author or message doesnt exist
                channel.send(primaryMessage);
                return console.log(`🚗 Guideline message doesn't exist or not sent by the bot - Sending a new one.`);
            }
        }
    }
}