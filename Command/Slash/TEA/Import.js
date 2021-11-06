const { getEmoji, apiCall } = require('../../../Utilities/functions');

module.exports = {
    name: 'import',
    description: 'Import data from different locations.',
    category: 'TEA',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'module',
            type: 'STRING',
            description: 'Import data from Google SpreadSheet to the MongoDB database.',
            required: true,
            choices: [
                { name: 'Threat Database', value: 'threat_spreadsheet' },
                { name: 'Club Roster', value: 'club_roster' }
            ]
        }
    ],

    execute(client, interaction, args) {
        const timer = process.hrtime();
        const { user, guild } = interaction;
        console.info(`[COMMAND] ${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        interaction
            .deferReply({ ephemeral: false })
            .catch(err => console.warn('Command/Slash/TEA/Import.js (1) Error to send interaction defer reply', err));

        if (args[0] === 'threat_spreadsheet') { // Import threat spreadsheet via API to MongoDB.
            apiCall('PUT', 'mongo/threat')
                .then(response => {
                    const timeDiff = process.hrtime(timer);
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} ${response.message} (${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s)\nAffected documents: **${response.data.affectedDocs.deleted}** Deleted and **${response.data.affectedDocs.inserted}** Inserted.` })
                        .catch(err => console.warn('Command/Slash/TEA/Import.js (x) Error to send interaction reply.', err));
                })
                .catch(err => {
                    console.warn('Command/Slash/TEA/Import.js (x) Error to receive API response.', err);
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Error to receive API response.` })
                        .catch(err => console.warn('Command/Slash/TEA/Import.js (x) Error to send interaction reply.', err));
                });
        }

        if (args[0] === 'club_roster') { // Import club roster spreadsheet via API to MongoDB.
            apiCall('PUT', 'mongo/certificate')
                .then(response => {
                    const timeDiff = process.hrtime(timer);
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} ${response.message} (${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s)\nAffected documents: **${response.data.affectedDocs.deleted}** Deleted and **${response.data.affectedDocs.inserted}** Inserted.` })
                        .catch(err => console.warn('Command/Slash/TEA/Import.js (x) Error to send interaction reply.', err));
                })
                .catch(err => {
                    console.warn('Command/Slash/TEA/Import.js (x) Error to receive API response.', err);
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Error to receive API response.` })
                        .catch(err => console.warn('Command/Slash/TEA/Import.js (x) Error to send interaction reply.', err));
                });
        }

    }
};