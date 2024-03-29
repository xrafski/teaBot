const { getEmote, apiCall } = require('../../../Utilities/functions');
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

    async execute(client, interaction, args) {
        const timer = process.hrtime();
        const { user, guild } = interaction;
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

        // Create interaction defer message.
        await interaction
            .deferReply({ ephemeral: false })
            .catch(err => logger.log('Command/Slash/TEA/Import.js (1) Error to send interaction defer reply', err)); // Catch interaction reply error.

        if (args[0] === 'threat_spreadsheet') { // Import threat spreadsheet via API to MongoDB.

            // API call to get required information for the command.
            apiCall('PUT', 'mongo/threat', null, (err, response) => {
                if (err) {
                    logger.log('Command/Slash/TEA/Import.js (2) API Response error', err); // Log API response error.

                    // Send interaction defer reply about the API error.
                    return interaction.editReply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Slash/TEA/Import.js (3) Error to send interaction defer reply.', err)); // Catch interaction reply error.
                }

                const timeDiff = process.hrtime(timer);

                // Send interaction defer reply with results.
                interaction.editReply({ content: `> ${getEmote('accept')} ${response.message} (${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s)\nAffected documents: **${response.data.affectedDocs.deleted}** Deleted and **${response.data.affectedDocs.inserted}** Inserted.` })
                    .catch(err => logger.log('Command/Slash/TEA/Import.js (4) Error to send interaction defer reply.', err)); // Catch interaction reply error.
            });
        }

        if (args[0] === 'club_roster') { // Import club roster spreadsheet via API to MongoDB.

            // API call to get required information for the command.
            apiCall('PUT', 'mongo/certificate', null, (err, response) => {
                if (err) {
                    logger.log('Command/Slash/TEA/Import.js (5) API Response error', err); // Log API response error.

                    // Send interaction defer reply about the API error.
                    return interaction.editReply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Slash/TEA/Import.js (6) Error to send interaction defer reply.', err)); // Catch interaction reply error.
                }

                const timeDiff = process.hrtime(timer);

                // Send interaction defer reply with results.
                interaction.editReply({ content: `> ${getEmote('accept')} ${response.message} (${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s)\nAffected documents: **${response.data.affectedDocs.deleted}** Deleted and **${response.data.affectedDocs.inserted}** Inserted.` })
                    .catch(err => logger.log('Command/Slash/TEA/Import.js (7) Error to send interaction defer reply.', err)); // Catch interaction reply error.
            });
        }
    }
};