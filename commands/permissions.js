const { botReply, TEAlogo, Discord } = require("../teaBot");
const config = require('../bot-settings.json');

module.exports.help = { 
    name: "permissions",
    description: "Check bot permissions on a specific server.",
    type: "botowner",
    usage: `ℹ️ Format: **${config.botPrefix}permissions** serverID(optional)\n\nℹ️ Example(s):\n${config.botPrefix}permissions\n${config.botPrefix}permissions 551715331638569420`
};

module.exports.run = async (bot, message, args) => {
    if (args[0]) return checkPermission(args[0]);
    else return checkPermission(message.guild.id);

    function checkPermission(guild) {
        if (!guild.match(/[0-9]/)) return botReply('Invalid serverID, only numbers are allowed.', message);

        const guildObj = bot.guilds.cache.get(guild);
        if (!guildObj) return botReply(`Bot can't find a server with provided ID.`, message);

        const botMember = guildObj.members.cache.get(bot.user.id);
        const permissionArray = ['ADMINISTRATOR', 'CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_EMOJIS', 'MANAGE_WEBHOOKS', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'VIEW_CHANNEL', 'VIEW_AUDIT_LOG', 'VIEW_GUILD_INSIGHTS', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'CHANGE_NICKNAME'];

        const permissionResults = [[], []];
        if (botMember) {
            permissionArray.forEach(permission => {
                if (botMember.hasPermission(permission)) permissionResults[0].push([`✅ ${permission}`]);
                else permissionResults[1].push([`❌ ${permission}`]);
            });
        } else botReply(`Bot was unable to check permissions.`, message);

        const embed_permission_results = new Discord.MessageEmbed()
            .setColor('#0095ff')
            .setAuthor(`Permission Check`, TEAlogo)
            .setDescription(`Permissions for '**${guildObj.name}**' server.\n‏‏‎ ‎‎`)
            .addFields(
                { name: 'Allowed permissions', value: allowedPermissions = permissionResults[0].join('\n') || `Bot doesn't have any allowed permissions.`, inline: false },
                { name: 'Disallowed permissions', value: disallowedPermissions = permissionResults[1].join('\n') || `Bot doesn't have any disallowed permissions.`, inline: false },
            )
            .setThumbnail(TEAlogo)
            .setTimestamp()
        return botReply(embed_permission_results, message);
    }
}