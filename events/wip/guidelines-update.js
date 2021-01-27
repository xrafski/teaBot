const config = require("../../bot-settings.json");
const { bot } = require('../../teaBot');
const fs = require('fs');

bot.on('ready', () => {
    // setInterval(() => { // Update guidelines on all TEA members (every 24 hours).
    //     checkGuidelines();
    // }, 3600000 * 24);
});

async function checkGuidelines() {

    // load certification file and parse to JSON object
    const cert = fs.readFileSync("./certification.json", "utf8");
    const certification = JSON.parse(cert);

    // define channel where embed is stored
    const pGuild = bot.guilds.cache.get(config.TEAserverID)
    const primaryGuildChannel = pGuild.channels.cache.find(ch => ch.name === config.guidelines.channelName);

    // when primaryGuildChannel is not found
    if (!primaryGuildChannel) return;

    // the bot permissions check
    if (primaryGuildChannel.permissionsFor(pGuild.me).has('READ_MESSAGE_HISTORY')) {
        const primaryGuildChannelFetch = await primaryGuildChannel.messages.fetch({ limit: 1 }).catch(() => { return });

        if (!primaryGuildChannelFetch || !primaryGuildChannelFetch.size) return;

        const primaryMessage = primaryGuildChannelFetch.first();
        if (!primaryMessage.embeds[0]) return;

        // forEach to send/update guidelines
        bot.guilds.cache.forEach((guild) => {
            if (guild.id === config.TEAserverID) return;
            const channel = guild.channels.cache.find(ch => ch.name === config.guidelines.channelName);

            if (certification[guild.id]) {
                if (channel) return updateGuidelines(guild, channel, primaryMessage.embeds[0]);
            }
        });
    }
}

async function updateGuidelines(guild, channel, primaryMessage) {

    if (!channel.permissionsFor(guild.me).has('READ_MESSAGE_HISTORY') || !channel.permissionsFor(guild.me).has('SEND_MESSAGES') || !channel.permissionsFor(guild.me).has('EMBED_LINKS')) return;

    const fetched = await channel.messages.fetch({ limit: 1 }).catch(() => { return });
    if (fetched) {

        const lastMessage = fetched.first();
        if (lastMessage && lastMessage.author === bot.user) { // if last message exist and the bot is an author

            // if guideline message is not an embed - I have to remove the previous one and send a new.
            if (!lastMessage.embeds[0]) {
                return lastMessage.delete()
                    .then(() => channel.send(primaryMessage))
                    .catch(() => { return });
            }

            // if guideline message has a different footer - Going to edit and update it.
            if (lastMessage.embeds[0].footer.text != primaryMessage.footer.text) {
                return lastMessage.edit(primaryMessage).catch(() => { return });
            } else return;

            // else guideline message doesn't exist or not sent by the bot - Sending a new one.
        } else return channel.send(primaryMessage).catch(() => { return });
    }
}