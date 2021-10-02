const { Client, Guild } = require('discord.js');
const { slashCommandsArray } = require('../../Handlers/Commands');
const { getEmoji, logger, registerGuildCommands } = require('../../Utilities/functions');

module.exports = {
    name: "guildCreate",
    once: false,
    /**
    * @param {Client} client
    * @param {Guild} guild
    */
    execute(client, guild) {
        registerGuildCommands(guild, slashCommandsArray)
            .then(res => logger('info', `Events/Client/guildCreate.js (1) '${client.user.username}' just joined '${guild.name}' server. ${res}`))
            .catch(error => logger('error', `Events/Client/guildCreate.js (2) '${client.user.username}' just joined '${guild.name}' server with an error to register slash commands.`, error));

        guild.systemChannel?.send(`Hello, I'm Trove Ethics Alliance Bot. ${getEmoji(client.config.TEAserverID, 'TEA')}\nThanks for inviting me, type **${client.config.bot.prefix}help** to check out my commands!\nIf you need any further information or want to report bugs, please do not hesitate to contact the bot owner\n(Discord: **${client.config.bot.owner.tag}** | Trove: **RNG**).`)
            .catch(error => logger('error', `Events/Client/guildCreate.js (3) Error to send 'systemChannel' message.`, error));
    }
}