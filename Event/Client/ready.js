// eslint-disable-next-line no-unused-vars
const { guildSlashCommandsArray, adminSlashCommandsArray } = require('../../Handler/Command');
const { registerGuildCommands } = require('../../Utilities/functions');
const logger = require('../../Utilities/logger');
const config = require('../../Utilities/settings/bot.json');

module.exports = {
    name: 'ready',
    once: true,
    /**
    * @param {Client} client
    */
    async execute(client) {
        logger.startup(`Event/Client/ready.js (1) Trove Ethics Alliance Bot ${config.bot.version} has logged in at ${new Date()}!`, `Version: ${config.bot.version}`);
        // console.log(guildSlashCommandsArray, adminSlashCommandsArray, globalSlashCommandsArray);
        // console.log(client.slashCommands);


        // Set guild slash commands
        client.guilds.cache.forEach(guild => {
            if (guild.id === client.config.commandCenter.guildID) {
                registerGuildCommands(guild, adminSlashCommandsArray)
                    .then(msg => logger.startup(`Event/Client/ready.js (1) [TEA] ${msg}`))
                    .catch(error => logger.warn(`Event/Client/ready.js (2) [TEA] Error to set slash commands for ${guild.name}`, error));
            }
            else {
                registerGuildCommands(guild, guildSlashCommandsArray)
                    .then(msg => logger.startup(`Event/Client/ready.js (3) ${msg}`))
                    .catch(error => logger.warn(`Event/Client/ready.js (4) Error to set slash commands for ${guild.name}`, error));
            }
        });


        // Set the client user's presence
        client.user.setPresence({ activities: [{ name: ' ', type: 'WATCHING' }], status: 'idle' });

        // Update bot's setPresence every hour
        setInterval(() => {
            let memberCount = 0;
            for (const guild of client.guilds.cache) memberCount = memberCount + guild[1].memberCount;

            client.user.setPresence({
                activities: [{
                    name: `${memberCount} users 👮‍♂️`,
                    type: 'WATCHING'
                }], status: 'online'
            });
        }, 1000 * 60 * 60);

    },
};