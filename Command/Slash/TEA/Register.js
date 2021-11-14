const { globalSlashCommandsArray } = require('../../../Handler/Command');
const { getEmote } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'register',
    description: 'Register slash commands.',
    category: 'TEA',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'module',
            type: 'STRING',
            description: 'Register a specific slash command group.',
            required: true,
            choices: [
                { name: 'Check registered global slash commands', value: 'registered' },
                { name: 'Register global slash commands', value: 'global' }
            ]
        }
    ],

    async execute(client, interaction, args) {
        const { user, guild } = interaction;
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} (1) used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

        if (args[0] === 'global') return regGlobalSlash(); // Run a function for 'global' argument.
        if (args[0] === 'registered') return checkRegistered(); // Run a function for 'registered' argument.

        function regGlobalSlash() {

            // Set global slash commands
            client.application.commands.set(globalSlashCommandsArray)
                .then(res => {

                    // Send interaction reply as a confirmation
                    interaction.reply({ content: `> ${getEmote('accept')} Bot's global slash commands has been updated/registered (**${res.size}** slash in total).\n> ${res.map(ele => `/${ele.name}`).join(' • ')}\n\n${getEmote('info')} It might take an hour to see changes.` })
                        .catch(err => logger.log('Command/Slash/TEA/Register.js (1) Error to send interaction reply', err)); // Catch interaction reply error.
                })
                .catch(err => {

                    // Send interaction reply when there is and error to set global commands.
                    interaction.reply({ content: `> ${getEmote('error')} Failed to set global slash commands.\n> ${err.message}` })
                        .catch(err => logger.log('Command/Slash/TEA/Register.js (2) Error to send interaction reply', err)); // Catch interaction reply error.
                });
        }

        function checkRegistered() {

            // Get bot global commands
            client.application.commands.fetch()
                .then(cmds => {

                    const commands = cmds.map(cmd => cmd.name);
                    // Send interaction reply as a confirmation
                    interaction.reply({ content: `> ${getEmote('TEA')} List of registered global slash commands:\n> \n> ${commands ? `/${commands.join('\n> /')}` : 'There are no registered global slash commands.'}` })
                        .catch(err => logger.log('Command/Slash/TEA/Register.js (3) Error to send interaction reply', err)); // Catch interaction reply error.
                })
                .catch(err => {

                    // Send interaction reply when there is and error to fetch global commands.
                    interaction.reply({ content: `> ${getEmote('error')} Failed to fetch slash commands data.\n> ${err.message}` })
                        .catch(err => logger.log('Command/Slash/TEA/Register.js (4) Error to send interaction reply', err)); // Catch interaction reply error.
                });
        }
    }
};


        // // Clear all guild slash commands.
        // await client.guilds.cache.forEach(guild => {
        //     guild.commands.set([])
        //         .then(logger.info(`Event/Client/ready.js (x) Commands cleared for ${guild.name}!`))
        //         .catch(error => logger.log(`Event/Client/ready.js (x) Error to clear '${guild.name}' guild slash commands.'`, error));
        // });