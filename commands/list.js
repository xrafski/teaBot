const { botReply, Discord, TEAlogo } = require("../teaBot");

module.exports.help = {
    name: "list",
    description: "List all guilds including its ID.",
    type: "botowner",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message) => {
    let clubList = '';
    bot.guilds.cache.forEach(guild => {
        clubList = clubList + `\n${guild.name} • '${guild.id}'`
        console.log(guild.name)
    });

    const embed_club_list = new Discord.MessageEmbed()
        .setColor('#0095ff')
        .setAuthor(`Club List`, TEAlogo)
        .setDescription((clubList.length > 2000 ? `${clubList.slice(0, 2000)}...` : `${clubList}`))
        .setThumbnail(TEAlogo)
        .setTimestamp()
    botReply(embed_club_list, message);
}