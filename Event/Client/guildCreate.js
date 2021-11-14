// const { guildSlashCommandsArray } = require('../../Handler/Command');
const { getEmote } = require('../../Utilities/functions');
const logger = require('../../Utilities/logger');

module.exports = {
    name: 'guildCreate',
    once: false,
    /**
    * @param {Client} client
    * @param {Guild} guild
    */
    execute(client, guild) {
        // registerGuildCommands(guild, guildSlashCommandsArray)
        //     .then(res => logger.info(`Event/Client/guildCreate.js (1) '${client.user.username}' just joined '${guild.name}' server. ${res}`))
        //     .catch(error => logger.log(`Event/Client/guildCreate.js (2) '${client.user.username}' just joined '${guild.name}' server with an error to register slash commands.`, error));

        logger.info(`Event/Client/guildCreate.js (1) '${client.user.username}' just joined '${guild.name}' server.`);
        guild.systemChannel?.send(`Hello, I'm${getEmote('TEA')} Trove Ethics Alliance Bot.\nThanks for inviting me\nIf you need any further information or want to report bugs, please do not hesitate to contact the bot owner\n(Discord: **${client.config.bot.owner.tag}**).`)
            .catch(error => logger.log('Event/Client/guildCreate.js (3) Error to send \'systemChannel\' message', error));
    },
};