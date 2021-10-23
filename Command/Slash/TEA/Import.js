const { getEmoji, interactionReply } = require('../../../Utilities/functions');
const { getSpreadSheetData } = require('../../../Utilities/import-spreadsheet');
const logger = require('../../../Utilities/logger');
const { threatModel } = require('../../../Schema/threatCollection');
const { certificationModel } = require('../../../Schema/certificationCollection');

const google = require('../../../Utilities/settings/google.json');
const serviceAccount = require('../../../Utilities/settings/secret/trove-ethics-alliance-service-account.json');

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

    execute(client, interaction, args) {
        const timer = process.hrtime();
        const { user, guild } = interaction;
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        if (args[0] === 'spreadsheet') {
            getSpreadSheetData(google.spreadsheet.threatList.id, google.spreadsheet.threatList.range, serviceAccount)
                .then(data => formatAndInsertThreatData(data))
                .catch(err => interaction.reply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Threat Database Spreadsheet Data import failed.\n\n**❌ Error details**:\`\`\`${err}\`\`\`` }));
        }

        if (args[0] === 'certification') {
            getSpreadSheetData(google.spreadsheet.clubRoster.id, google.spreadsheet.clubRoster.range, serviceAccount)
                .then(data => formatAndInsertCertificationData(data))
                .catch(err => interaction.reply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Certification Spreadsheet Data import failed.\n\n**❌ Error details**:\`\`\`${err}\`\`\`` }));
        }


        /**
         * Remove rows that have under 3 character length names, Push remaining data into an array, clear MongoDB collection and repopulate it with a new data.
         * @param {Object} data data received from getSpreadSheetData() fucntion.
         */
        function formatAndInsertThreatData(data) {
            // const TEA = data.data.values.filter(value => Object.keys(value).length != 0 && value[2] != '' && value[10] != ''); // filter out empty rows.
            const TEA = data.data.values.filter(row => row[1]?.length >= 3); // filter out rows without requirements: name (3 characters).

            const JSONobj = [];
            TEA.forEach(element => { // create a forEach[spreadsheed row] loop and push data to JSONobj array.

                // Transform undefined or empty cells into null object.
                const name = element[1]; // has to have at least 3 symbols (ALWAYS)
                const warning = element[2] === '' ? null : element[2];
                const reason = element[3] === '' ? null : element[3];
                const status = element[4] === '' ? null : element[4];
                const evidence = element[5] === '' ? null : element[5];
                const alternates = element[6] === '' ? null : element[6];
                const discord = element[7] === '' ? null : element[7];
                const notes = element[8] === '' ? null : element[8];
                const personal = element[9] === '' ? null : element[9];

                JSONobj.push({ name, warning, reason, status, evidence, alternates, discord, notes, personal });
            });

            threatModel.deleteMany({}) // Remove all documents from the threat model.
                .then(() => {
                    threatModel.insertMany(JSONobj) // Insert to the threat model all data inside JSONobj.
                        .then(docs => {
                            const timeDiff = process.hrtime(timer);
                            interactionReply(interaction, `${getEmoji(client.config.TEAserverID, 'TEA')} **Threat Database** data has been imported successfully!\n> **${docs.length}** documents updated in **${timeDiff[0]}.${timeDiff[1].toString().slice(0, 2)}s**.`, false, 'Command/Slash/TEA/Import.js (1)');
                        })
                        .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserverID, 'TEA')} **Threat Database** data import failed.\n\n**❌ Error details**:\`\`\`${err}\`\`\``, false, 'Command/Slash/TEA/Import.js (2)'));
                })
                .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserverID, 'TEA')} **Threat Database** data import failed.\n\n**❌ Error details**:\`\`\`${err}\`\`\``, false, 'Command/Slash/TEA/Import.js (3)'));
        }

        /**
         * Remove rows that have under 3 character length club names, Push remaining data into an array, clear MongoDB collection and repopulate it with a new data.
         * @param {Object} data data received from getSpreadSheetData() fucntion.
         */
        function formatAndInsertCertificationData(data) {
            const TEA = data.data.values.filter(row => row[0]?.length >= 3); // filter out rows without requirements: name (3 characters).

            const JSONobj = [];
            TEA.forEach(element => { // create a forEach[spreadsheed row] loop and push data to JSONobj array.

                // Transform undefined or empty cells into null object.
                const club = element[0]; // has to have at least 3 symbols (ALWAYS)
                const description = element[1] === '' ? null : element[1];
                const world = element[2] === '' ? null : element[2];
                const requirements = element[3] === '' ? null : element[3];
                const representative = element[4] === '' ? null : element[4];
                const invite = element[5] === '' ? null : element[5];
                const id = element[6] === '' ? null : element[6];

                JSONobj.push({ club, description, world, requirements, representative, discord: { invite, id } });
            });

            certificationModel.deleteMany({}) // Remove all documents from the certification model.
                .then(() => {
                    certificationModel.insertMany(JSONobj) // Insert to the certification model all data inside JSONobj.
                        .then(docs => {
                            const timeDiff = process.hrtime(timer);
                            interactionReply(interaction, `${getEmoji(client.config.TEAserverID, 'TEA')} **Certification Database** data has been imported successfully!\n> **${docs.length}** documents updated in **${timeDiff[0]}.${timeDiff[1].toString().slice(0, 2)}s**.`, false, 'Command/Slash/TEA/Import.js (4)');
                        })
                        .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserverID, 'TEA')} **Certification Database** data import failed.\n\n**❌ Error details**:\`\`\`${err}\`\`\``, false, 'Command/Slash/TEA/Import.js (5)'));
                })
                .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserverID, 'TEA')} **Certification Database** data import failed.\n\n**❌ Error details**:\`\`\`${err}\`\`\``, false, 'Command/Slash/TEA/Import.js (6)'));
        }

    }
};