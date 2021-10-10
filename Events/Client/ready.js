// eslint-disable-next-line no-unused-vars
const { guildSlashCommandsArray, adminSlashCommandsArray, globalSlashCommandsArray } = require('../../Handlers/Commands');
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
        await logger('startup', `Events/Client/ready.js (1) Trove Ethics Alliance Bot ${config.bot.version} has logged in!`, `Version: ${config.bot.version}`);

        // console.log(guildSlashCommandsArray, adminSlashCommandsArray, globalSlashCommandsArray);
        // console.log(client.slashCommands);

        // Set global slash commands
        // await client.application.commands.set(globalSlashCommandsArray)
        //     .then(res => logger('startup', `Events/Client/ready.js (2) Global client slash commands has been updated '${res.size}' ${res.map(ele => `/${ele.name}`).join(' • ')}`))
        //     .catch(err => logger('error', 'Events/Client/ready.js (3) Error to register global client slash commands', err));

        // Clear all guild slash commands.
        // await client.guilds.cache.forEach(guild => {
        //     guild.commands.set([])
        //         .then(logger('info', `Events/Client/ready.js (x) Commands cleared for ${guild.name}!`))
        //         .catch(error => logger('error', `Events/Client/ready.js (x) Error to clear '${guild.name}' guild slash commands.'`, error));
        // });

        // Set guild slash commands
        await client.guilds.cache.forEach(guild => {
            if (guild.id === client.config.TEAserverID) {
                registerGuildCommands(guild, guildSlashCommandsArray.concat(adminSlashCommandsArray))
                    .then(msg => logger('startup', `Events/Client/ready.js (4) [TEA] ${msg}`))
                    .catch(error => logger('warn', `Events/Client/ready.js (5) [TEA] Error to set slash commands for ${guild.name}`, error));
            }
            else {
                registerGuildCommands(guild, guildSlashCommandsArray)
                    .then(msg => logger('startup', `Events/Client/ready.js (6) ${msg}`))
                    .catch(error => logger('warn', `Events/Client/ready.js (7) Error to set slash commands for ${guild.name}`, error));
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