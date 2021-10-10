const logger = require("../../Utilities/logger");

module.exports = {
    name: 'guildDelete',
    once: false,
    /**
    * @param {Client} client
    * @param {Guild} guild
    */
    execute(client, guild) {
        logger('info', `Events/Client/guildDelete.js (1) ${client.user.username} just left '${guild.name}' server.`);
    },
};