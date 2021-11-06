const { getEmoji, apiCall } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

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
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

        // Create interaction defer message.
        interaction
            .deferReply({ ephemeral: false })
            .catch(err => logger.log('Command/Slash/TEA/Import.js (1) Error to send interaction defer reply', err)); // Catch interaction reply error.

        if (args[0] === 'threat_spreadsheet') { // Import threat spreadsheet via API to MongoDB.

            // API call to get required information for the command.
            apiCall('PUT', 'mongo/threat')
                .then(response => {
                    const timeDiff = process.hrtime(timer);

                    // Send interaction defer reply with results.
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} ${response.message} (${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s)\nAffected documents: **${response.data.affectedDocs.deleted}** Deleted and **${response.data.affectedDocs.inserted}** Inserted.` })
                        .catch(err => logger.log('Command/Slash/TEA/Import.js (2) Error to send interaction defer reply.', err)); // Catch interaction reply error.
                })
                .catch(err => { // API Error handler.
                    logger.log('Command/Slash/TEA/Import.js (3) Error to receive API response.', err); // Log API response error.

                    // Send interaction defer reply about the API error.
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Error to receive API response.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Slash/TEA/Import.js (4) Error to send interaction defer reply.', err)); // Catch interaction reply error.
                });
        }

        if (args[0] === 'club_roster') { // Import club roster spreadsheet via API to MongoDB.

            // API call to get required information for the command.
            apiCall('PUT', 'mongo/certificate')
                .then(response => {
                    const timeDiff = process.hrtime(timer);

                    // Send interaction defer reply with results.
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} ${response.message} (${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s)\nAffected documents: **${response.data.affectedDocs.deleted}** Deleted and **${response.data.affectedDocs.inserted}** Inserted.` })
                        .catch(err => logger.log('Command/Slash/TEA/Import.js (5) Error to send interaction defer reply.', err)); // Catch interaction reply error.
                })
                .catch(err => { // API Error handler.
                    logger.log('Command/Slash/TEA/Import.js (6) Error to receive API response.', err); // Log API response error.

                    // Send interaction defer reply about the API error.
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Error to receive API response.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Slash/TEA/Import.js (7) Error to send interaction defer reply.', err)); // Catch interaction reply error.
                });
        }
    }
};