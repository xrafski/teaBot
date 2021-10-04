const { guildSlashCommandsArray, adminSlashCommandsArray, globalSlashCommandsArray } = require('../../Handlers/Commands');
const { logger, registerGuildCommands } = require('../../Utilities/functions');
const config = require('../../Utilities/settings/bot.json');

module.exports = {
    name: "ready",
    once: true,
    /**
    * @param {Client} client
    */
    execute(client) {
        logger('startup', `Events/Client/ready.js (1) Trove Ethics Alliance Bot ${config.bot.version} has logged in!`, `Version: ${config.bot.version}`);

        // console.log(guildSlashCommandsArray, adminSlashCommandsArray, globalSlashCommandsArray);
        // console.log(client.slashCommands);

        // setTimeout(() => { // Set global slash commands 5 seconds after bot is started.
        //     client.application.commands.set(globalSlashCommandsArray)
        //     // .then(logger('update', `Events/Client/ready.js (1) `))
        //     .then(res => console.log(`Events/Client/ready.js (1) Global client slash commands has been updated`, res))
        //     .catch(console.error);
        // }, 5000);

        // client.guilds.cache.forEach(guild => { // Clear all guild slash commands.
        //     guild.commands.set([])
        //         .then(logger('info', `Commands cleared for ${guild.name}!`))
        //         .catch(error => console.trace(`${guild.name}`, error));
        // });

        client.guilds.cache.forEach(guild => { // Set guild slash commands
            if (guild.id === client.config.TEAserverID)
                registerGuildCommands(guild, guildSlashCommandsArray.concat(adminSlashCommandsArray))
                    .then(msg => logger('startup', `Events/Client/ready.js (2) [TEA] ${msg}`))
                    .catch(error => logger('warn', `Events/Client/ready.js (3) [TEA] Error to set slash commands for ${guild.name}`, error));
            else registerGuildCommands(guild, guildSlashCommandsArray)
                .then(msg => logger('startup', `Events/Client/ready.js (4) ${msg}`))
                .catch(error => logger('warn', `Events/Client/ready.js (5) Error to set slash commands for ${guild.name}`, error));
        });

        // Set the client user's presence
        try {
            client.user.setPresence({ activities: [{ name: ' ', type: 'WATCHING' }], status: 'idle' })
        } catch (error) {
            logger('error', `Events/Client/ready.js (6) Error to set the bot activity status.`, error);
        }

        setInterval(() => { // Update bot's setPresence every hour
            let memberCount = 0;
            for (const guild of client.guilds.cache) memberCount = memberCount + guild[1].memberCount;
            client.user.setPresence({ activities: [{ name: `${memberCount} users 👮‍♂️`, type: 'WATCHING' }], status: 'online' });
        }, 3600000);

    }
}