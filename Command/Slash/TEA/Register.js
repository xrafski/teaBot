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
                { name: 'Register Global Slash Commands', value: 'global' }
            ]
        }
    ],

    async execute(client, interaction, args) {
        const { user, guild } = interaction;
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        if (args[0] === 'global') return regGlobalSlash();

        async function regGlobalSlash() {
            // Set global slash commands
            await client.application.commands.set(globalSlashCommandsArray)
                .then(res => interactionReply(interaction, `${getEmoji(client.config.TEAserverID, 'TEA')} Bot's global slash commands has been updated/registered (**${res.size}** slash in total).\n> ${res.map(ele => `/${ele.name}`).join(' • ')}\n\nNOTE: It might take an hour to see the changes.`, false, 'Command/Slash/TEA/Register.js (1)'))
                .catch(err => logger.error('Command/Slash/TEA/Register.js (2) Error to register global client slash commands.', err));
        }
    }
};


        // // Clear all guild slash commands.
        // await client.guilds.cache.forEach(guild => {
        //     guild.commands.set([])
        //         .then(logger.info(`Event/Client/ready.js (x) Commands cleared for ${guild.name}!`))
        //         .catch(error => logger.error(`Event/Client/ready.js (x) Error to clear '${guild.name}' guild slash commands.'`, error));
        // });