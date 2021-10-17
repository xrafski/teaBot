const { getEmoji } = require('../../../Utilities/functions');
const { getSpreadSheetData } = require('../../../Utilities/import-spreadsheet');
const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'import',
    description: 'Import data from different locations (\'Command Access\' role required).',
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
                { name: 'spreadsheet', value: 'spreadsheet' },
                { name: 'certification', value: 'certification' }
            ]
        }
    ],
    /**
     * @param {Client} client 1
     * @param {CommandInteraction} interaction
     */
    execute(client, interaction, args) {
        const { user, guild } = interaction;
        logger('command', `${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        console.log(args, interaction);

        if (args[0] === 'spreadsheet') {
            getSpreadSheetData()
                .then(console.log)
                .catch(console.error);


            interaction.reply({
                content: `${getEmoji(client.config.TEAserverID, 'TEA')} Response correctly handled for spreadsheets value!`,
                ephemeral: true
            });
        } else {
            interaction.reply({
                content: `${getEmoji(client.config.TEAserverID, 'TEA')} Response correctly handled!`,
                ephemeral: true
            });
        }
    },
};