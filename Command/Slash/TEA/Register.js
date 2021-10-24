const { globalSlashCommandsArray } = require('../../../Handler/Command');
const { getEmoji, interactionReply } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'register',
    description: 'Register slash commands.',
    // defaultPermission: false,
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
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        if (args[0] === 'global') return regGlobalSlash();
        if (args[0] === 'registered') return checkRegistered();

        async function regGlobalSlash() {
            // Set global slash commands
            await client.application.commands.set(globalSlashCommandsArray)
                .then(res => interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Bot's global slash commands has been updated/registered (**${res.size}** slash in total).\n> ${res.map(ele => `/${ele.name}`).join(' • ')}\n\nNOTE: It might take an hour to see the changes.`, false, 'Command/Slash/TEA/Register.js (1)'))
                .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Failed to set global slash commands.\n> ${err.message}`, false, 'Command/Slash/TEA/Register.js (2)'));
        }

        function checkRegistered() {
            // Get bot global commands
            client.application.commands.fetch()
                .then(cmds => {
                    const commands = cmds.map(cmd => cmd.name);
                    interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} List of registered global slash commands:\n> \n> /${commands.join('\n> /')}`, false, 'Command/Slash/TEA/Register.js (3)');
                })
                .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Failed to fetch slash commands data.\n> ${err.message}`, false, 'Command/Slash/TEA/Register.js (4)'));
        }
    }
};


        // // Clear all guild slash commands.
        // await client.guilds.cache.forEach(guild => {
        //     guild.commands.set([])
        //         .then(logger.info(`Event/Client/ready.js (x) Commands cleared for ${guild.name}!`))
        //         .catch(error => logger.error(`Event/Client/ready.js (x) Error to clear '${guild.name}' guild slash commands.'`, error));
        // });