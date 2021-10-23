const { getEmoji } = require('../../../Utilities/functions');

module.exports = {
    name: 'register',
    description: 'Register slash commands (\'Command Access\' role required).',
    // defaultPermission: false,
    category: 'TEA',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'module',
            type: 'STRING',
            description: 'Import data from Google SpreadSheet (Threat Database[spreadsheet] or Club Roster[certification])',
            required: true,
            choices: [
                { name: 'global', value: 'global' },
                { name: 'guild', value: 'guild' },
                { name: 'admin', value: 'admin' }
            ]
        }
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    execute(client, interaction, args) {
        interaction.editReply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Response` });

    }
};