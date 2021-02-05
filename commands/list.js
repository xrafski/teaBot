const { botReply, Discord, TEAlogo } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = {
    name: "list",
    description: "List all guilds including its ID.",
    type: "botowner",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message) => {
    let clubList = '';
    bot.guilds.cache.forEach(guild => {

        for (const hidden of config.certification.hiddenServers) {
            if (guild.id === hidden.guildDiscordID) return;
        }

        clubList = clubList + `\n${guild.name} • '${guild.id}'`
    });

    const embed_club_list = new Discord.MessageEmbed()
        .setColor('#0095ff')
        .setAuthor(`Club List`, TEAlogo)
        .setDescription(clubList = (clubList.length > 2000 ? `${clubList.slice(0, 2000)}...` : `${clubList}`) || 'No clubs found.')
        .setThumbnail(TEAlogo)
        .setTimestamp()
    botReply(embed_club_list, message);
}