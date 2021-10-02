const { slashCommandsArray, adminSlashCommandsArray, globalSlashCommandsArray } = require('../../Handlers/Commands');
const { logger, registerGuildCommands } = require('../../Utilities/functions');
const config = require('../../Utilities/settings/bot.json');

module.exports = {
    name: "ready",
    once: true,
    /**
    * @param {Client} client
    */
    execute(client) {
        logger('update', `Events/Client/ready.js (1) Trove Ethics Alliance Bot ${config.bot.version} has logged in!`, `Version: ${config.bot.version}`);

        console.log(slashCommandsArray, adminSlashCommandsArray, globalSlashCommandsArray);
        // console.log(client.slashCommands);

        // display what commands are available.
        setTimeout(() => {
            // const globalSlashCommands = client.slashCommands.map(command => command.name).join(' • ');
            const adminSlashCommands = client.slashCommands.filter(command => command.category === 'TEA').map(command => command.name).join(' • ');
            const globalSlashCommands = client.slashCommands.filter(command => command.category === 'GLOBAL').map(command => command.name).join(' • ');
            const guildSlashCommands = client.slashCommands.filter(command => command.category === '').map(command => command.name).join(' • ');
            console.log(`~~~~~~~~~~~~~~ SLASH COMMANDS LOADED (${client.slashCommands.size}) ~~~~~~~~~~~~~~\nTEA Admin 👮‍♀️ ${adminSlashCommands}\nGlobal 🌍 ${globalSlashCommands}\nGuild 🥒 ${guildSlashCommands}`);
        }, 3000);

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




        // const MainServer = client.guilds.cache.get(client.config.TEAserverID)
        // MainServer.commands.fetch()
        //     .then(console.log)
        //     .catch(console.trace);










        // client.guilds.cache.forEach(guild => { // Set guild slash commands

        //     if (guild.id === client.config.TEAserverID)
        //         registerGuildCommands(guild, slashCommandsArray.concat(adminSlashCommandsArray))
        //             .then(msg => logger('info', `Event/Client/ready.js (2) [TEA] ${msg}`))
        //             .catch(error => logger('error', `Event/Client/ready.js (3) [TEA] Error to set slash commands for ${guild.name}`, error));
        //     else registerGuildCommands(guild, slashCommandsArray)
        //         .then(msg => logger('info', `Event/Client/ready.js (4) ${msg}`))
        //         .catch(error => logger('error', `Event/Client/ready.js (5) Error to set slash commands for ${guild.name}`, error));
        // });

        // Set the client user's presence
        try {
            client.user.setPresence({ activities: [{ name: ' ', type: 'WATCHING' }], status: 'idle' })
        } catch (error) {
            logger('error', `Events/Client/ready.js (2) Error to set the bot activity status.`, error);
        }

        setInterval(() => { // Update bot's setPresence every hour
            let memberCount = 0;
            for (const guild of client.guilds.cache) memberCount = memberCount + guild[1].memberCount;
            client.user.setPresence({ activities: [{ name: `${memberCount} users 👮‍♂️`, type: 'WATCHING' }], status: 'online' });
        }, 3600000);

    }
}