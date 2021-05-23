const { botReply, Discord, TEAlogo } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = {
    name: "list",
    description: "List all guilds including its ID.",
    type: "botowner",
    usage: `ℹ️ Format: **${config.botDetails.prefix}list**`
};

module.exports.run = async (bot, message) => {
    let clubList = '';
    let memberCount = 0;
    bot.guilds.cache.forEach(guild => {
        memberCount = memberCount + guild.memberCount;

        for (const hidden of config.certification.hiddenServers) {
            if (guild.id === hidden.guildDiscordID) return;
        }
        clubList = clubList + `\n**${guild.name}**(${guild.memberCount}) ► ${guild.id}`;
    });

    const embed_club_list = new Discord.MessageEmbed()
        .setColor('#0095ff')
        .setAuthor(`Club List (${bot.guilds.cache.size} servers with ${memberCount} users)`, TEAlogo)
        .setDescription(clubList = (clubList.length > 2000 ? `${clubList.slice(0, 2000)}...` : `${clubList}`) || 'No clubs found.')
        .setThumbnail(TEAlogo)
        .setTimestamp();
    botReply(embed_club_list, message);
};