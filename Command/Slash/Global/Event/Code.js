const { Permissions } = require('discord.js');
const { apiCall, errorResponseHandlerAPI } = require('../../../../Utilities/functions');
const moment = require('moment');
const logger = require('../../../../Utilities/logger');

module.exports = {
    name: 'code',
    description: 'Manage server codes',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [

        // Option to list all available codes.
        {
            type: 1,
            name: 'list',
            description: '[KICK] List codes that are associated to this server.',
            options: [
                {
                    type: 3,
                    name: 'range',
                    description: 'Select range of codes to display.',
                    choices: [
                        {
                            name: 'all',
                            value: 'all_codes'
                        },
                        {
                            name: 'claimed',
                            value: 'claimed_codes'
                        },
                        {
                            name: 'unclaimed',
                            value: 'unclaimed_codes'
                        }
                    ],
                    required: true
                }
            ]
        },

        // Option to create new codes on the server.
        {
            type: 1,
            name: 'create',
            description: '[KICK] Create a new event code.',
            options: [
                {
                    type: 3,
                    name: 'id',
                    description: 'Type an ID to identify the code.',
                    required: true
                },
                {
                    type: 3,
                    name: 'prize',
                    description: 'Assign a prize to the code.',
                    required: true
                },
                {
                    type: 3,
                    name: 'hint',
                    description: 'Hint to help players find this code.',
                    required: false
                }
            ]
        },

        // Option to display status of a specific code.
        {
            type: 1,
            name: 'check',
            description: '[KICK] Check status of a specific code.',
            options: [
                {
                    type: 3,
                    name: 'id',
                    description: 'Type an ID to identify the code.',
                    required: true
                }
            ]
        },

        // Option to remove the code from the server.
        {
            type: 1,
            name: 'remove',
            description: '[KICK] Remove the code from the pool.',
            options: [
                {
                    type: 3,
                    name: 'id',
                    description: 'Type an ID to identify the code.',
                    required: true
                }
            ]
        }
    ],

    async execute(client, interaction, args) {
        const { user, guild, member } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

        // Check if command used on direct message.
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: '> 🔒 This command is not available on direct message!',
                ephemeral: false,
            }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (1) Error to send reply', err));
        }


        // Check if user is allowed to use this command (KICK).
        if (!member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({
                content: '> 🔒 This command is only available for users with **kick members** permission!',
                ephemeral: true,
            }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (2) Error to send reply', err));
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: true })
            .catch(err => logger.log('Command/Slash/Global/Event/Code.js (3) Error to create interaction defer', err));


        // Call API to get required information about club certificate.
        apiCall('GET', `certificate/${guild.id}`, null, (err, certResponse) => {
            // Catch API error and move to error handler.
            if (err) {

                // Log API error event in the console.
                logger.log('Command/Slash/Global/Event/Code.js (4) Error to get API response', err);

                // Send error message to the user.
                return interaction.editReply({
                    content: errorResponseHandlerAPI(err),
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (5) Error to send interaction defer reply', err));
            }

            // Check if guild is certified.
            if (!certResponse) {
                return interaction.editReply({ content: '> 🔒 This command is only available for registered members of Trove Ethics Alliance!' })
                    .catch(err => logger.log('Command/Slash/Global/Event/Code.js (6) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
            }

            // Create switch to run a function depending on arguments passed.
            switch (args[0]) {
                case 'create': return createCode();
                case 'check': return checkCode();
                case 'remove': return removeCode();
                case 'list': {
                    switch (args[1]) {
                        case 'all_codes': return listCodes('all_codes');
                        case 'claimed_codes': return listCodes('claimed_codes');
                        case 'unclaimed_codes': return listCodes('unclaimed_codes');
                        default: return interaction.editReply({
                            content: 'This command type is not supported yet. Please try again later.',
                            ephemeral: true
                        }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (7) Error to send interaction defer reply', err));
                    }
                }

                default: return interaction.editReply({
                    content: 'This command type is not supported yet. Please try again later.',
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (8) Error to send interaction defer reply', err));
            }
        });


        /**
         * Function to create a new code.
         */
        function createCode() {

            let validationString = '';

            // Check if args[1] (ID) is alphanumeric.
            if (!/^[a-z0-9]{3,20}$/.test(args[1])) {
                validationString += '\n• Code ID must be alphanumeric and between 3-20 characters long!';
            }

            // Check if args[2] (prize) is between 3-50 characters long.
            if (args[2].length < 5 || args[2].length > 50) {
                validationString += '\n• Prize must be between 5-50 characters long!';
            }

            // Check if args[3] (hint) is between 5-70 characters long.
            if (args[3] && args[3].length < 5 || args[3] && args[3].length > 70) {
                validationString += '\n• Optional hint must be between 5-70 characters long!';
            }

            // Check if any validation failed.
            if (validationString) {
                return interaction.editReply({
                    content: `> 🥶 ${user}, the following validation errors were found:\n\`\`\`${validationString}\`\`\``,
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (9) Error to send interaction defer reply', err));
            }

            // Check if amount of codes doesn't exceed limit.
            apiCall('GET', `code/count/${interaction.guildId}`, null, (err, coundDocuments) => {

                // Catch API error and move to error handler.
                if (err) {

                    // Log API error event in the console.
                    logger.log('Command/Slash/Global/Event/Code.js (10) Error to get API response', err);

                    // Send error message to the user.
                    return interaction.editReply({
                        content: errorResponseHandlerAPI(err),
                        ephemeral: true
                    }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (11) Error to send interaction defer reply', err));
                }

                // Check if amount of documents doesn't exceed the limit.
                if (client.config.event.limit > coundDocuments) {

                    // Create an object with required data for mongo.
                    const createData = {
                        identifier: `${interaction.guildId}-${args[1]}`,
                        code: args[1],
                        server: interaction.guildId,
                        hint: args[3],
                        prize: args[2]
                    };

                    // Call an API endpoint to create a new document in the database.
                    apiCall('POST', 'code/create', createData, (err, res) => {

                        // Catch API error and move to error handler.
                        if (err) {

                            // Log API error event in the console.
                            logger.log('Command/Slash/Global/Event/Code.js (12) Error to get API response', err);

                            // Send error message to the user.
                            return interaction.editReply({
                                content: errorResponseHandlerAPI(err),
                                ephemeral: true
                            }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (13) Error to send interaction defer reply', err));
                        }

                        // Send interaction reply with success message.
                        return interaction.editReply({
                            content: `✅ Code successfully created and valid for next 2 months (till **${moment(res.createdAt).add(90, 'days').format('Do MMMM YYYY')}**)\n_Additional 2 months if code being claimed._\`\`\`Code: '${res.code}'\nPrize: '${res.prize}'${res.hint ? `\nHint: '${res.hint}'` : ''}\`\`\`\n> ${coundDocuments + 1} of **${client.config.event.limit}** codes created on this server.`,
                            ephemeral: true
                        }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (14) Error to send interaction defer reply', err));
                    });

                } else {
                    // Send error message to the user.
                    return interaction.editReply({
                        content: `> ⚠ **Server Limit Reached**\nThis server has already **${client.config.event.limit}** codes which is the limit.\nPlease remove old codes and try again later.\n\nYou can use **/code list** command to list codes registered on this server.`,
                        ephemeral: true
                    }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (15) Error to send interaction defer reply', err));
                }
            });
        }

        function checkCode() {

            // Check if args[1] (ID) is alphanumeric.
            if (!/^[a-z0-9]{3,25}$/.test(args[1])) {
                return interaction.editReply({
                    content: '> 🥶 Code ID must be alphanumeric and between 3-25 characters long!',
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (16) Error to send interaction defer reply', err));

            }

            // Call an API endpoint to get data from a specific document in the database.
            apiCall('GET', `code/check/${interaction.guildId}/${args[1]}`, null, (err, res) => {

                // Catch API error and move to error handler.
                if (err) {

                    // Log API error event in the console.
                    logger.log('Command/Slash/Global/Event/Code.js (17) Error to get API response', err);

                    // Send error message to the user.
                    return interaction.editReply({
                        content: errorResponseHandlerAPI(err),
                        ephemeral: true
                    }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (18) Error to send interaction defer reply', err));
                }

                // Check if document exists.
                if (!res) {
                    return interaction.editReply({
                        content: `> ❌ Document associated with provided (**${args[1]}**) code is not found on this server!`,
                        ephemeral: true
                    }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (19) Error to send interaction defer reply', err));
                }

                const { claimed, code, createdAt, hint, prize, updatedAt } = res;

                // Return existing document data.
                return interaction.editReply({
                    content: `> ${claimed ? `**⭐ CLAIMED**\nUser: <@${res.winner.id}> • **${res.winner.tag}** • ${res.winner.id}\nClaimed on ${moment.utc(updatedAt).format('Do MMMM YYYY @ h:mm:ss a UTC')} (${moment(updatedAt).fromNow()})` : '**▶ UNCLAIMED**'}

__Code Information:__
ID: **${code}**\nPrize: **${prize}**
Hint: **${hint}**
Created on ${moment.utc(createdAt).format('Do MMMM YYYY @ h:mm:ss a UTC')} (${moment(createdAt).fromNow()})`,
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (20) Error to send interaction defer reply', err));

            });
        }

        function removeCode() {

            // Check if args[1] (ID) is alphanumeric.
            if (!/^[a-z0-9]{3,25}$/.test(args[1])) {
                return interaction.editReply({
                    content: '> 🥶 Code ID must be alphanumeric and between 3-25 characters long!',
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (21) Error to send interaction defer reply', err));

            }

            // Call an API endpoint to remove a specific document in the database.
            apiCall('DELETE', `code/remove/${interaction.guildId}/${args[1]}`, null, (err, res) => {

                // Catch API error and move to error handler.
                if (err) {

                    // Log API error event in the console.
                    logger.log('Command/Slash/Global/Event/Code.js (22) Error to get API response', err);

                    // Send error message to the user.
                    return interaction.editReply({
                        content: errorResponseHandlerAPI(err),
                        ephemeral: true
                    }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (23) Error to send interaction defer reply', err));
                }

                // Send response if document is not found.
                if (!res) {
                    return interaction.editReply({
                        content: '> ♿ **Seems like this code doesn\'t exists.**\n\nMake sure you typed that correctly and try again.\nAlso, you can use **/code check** to see if code exists and its status if does.',
                        ephemeral: true
                    }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (24) Error to send interaction defer reply', err));
                }

                // Send response with document being removed successfully.
                return interaction.editReply({
                    content: `${user}, You have successfully removed the code **${res.code}** from this server and is not longer available to be claimed.`,
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (25) Error to send interaction defer reply', err));
            });
        }

        function listCodes(type) {
            switch (type) {
                case 'all_codes': {

                    // Call an API endpoint to list a specific documents in the database.
                    return apiCall('GET', `code/list/all/${interaction.guildId}`, null, async function (err, res) {

                        // Catch API error and move to error handler.
                        if (err) {

                            // Log API error event in the console.
                            logger.log('Command/Slash/Global/Event/Code.js (26) Error to get API response', err);

                            // Send error message to the user.
                            return interaction.editReply({
                                content: errorResponseHandlerAPI(err),
                                ephemeral: true
                            }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (27) Error to send interaction defer reply', err));
                        }

                        // Run a function to handle the response.
                        return discordReply(res);
                    });
                }

                case 'claimed_codes': {

                    // Call an API endpoint to list a specific documents in the database.
                    return apiCall('GET', `code/list/claimed/${interaction.guildId}`, null, async function (err, res) {

                        // Catch API error and move to error handler.
                        if (err) {

                            // Log API error event in the console.
                            logger.log('Command/Slash/Global/Event/Code.js (28) Error to get API response', err);

                            // Send error message to the user.
                            return interaction.editReply({
                                content: errorResponseHandlerAPI(err)
                            }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (29) Error to send interaction defer reply', err));
                        }

                        // Run a function to handle the response.
                        return discordReply(res);
                    });
                }

                case 'unclaimed_codes': {

                    // Call an API endpoint to list a specific documents in the database.
                    return apiCall('GET', `code/list/unclaimed/${interaction.guildId}`, null, async function (err, res) {

                        // Catch API error and move to error handler.
                        if (err) {

                            // Log API error event in the console.
                            logger.log('Command/Slash/Global/Event/Code.js (30) Error to get API response', err);

                            // Send error message to the user.
                            return interaction.editReply({
                                content: errorResponseHandlerAPI(err)
                            }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (31) Error to send interaction defer reply', err));
                        }

                        // Run a function to handle the response.
                        return discordReply(res);
                    });
                }

                default: return interaction.editReply({
                    content: 'This command interation is not supported yet. Please try again later.'
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (32) Error to send interaction defer reply', err));
            }

            function discordReply(res) {

                // String object to store information about the codes.
                let outputString = '';

                // Go through all the codes and format them to outputString.
                res.forEach(doc => {
                    outputString += doc.claimed ? `📤 '**${doc.code}**' claimed by <@${doc.winner.id}>.\n` : `📥 '${doc.code}' created on ${moment(doc.updatedAt).format('Do MMMM')}.\n`;
                });

                // If there is a outputString filled with data.
                if (outputString) {
                    return interaction.editReply({
                        content: `ℹ List of codes on this server.\n\n${outputString}\nNOTE: You can use **/code check** too see details for a specific code.`
                    }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (33) Error to send interaction defer reply', err));
                } // Catch interaction defer reply error.

                // Otherwise send interaction reply about empty outputString.
                return interaction.editReply({
                    content: 'ℹ No codes were found for this category.\n\nNOTE: You can use **/code create** to add new codes.'
                }).catch(err => logger.log('Command/Slash/Global/Event/Code.js (34) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
            }
        }
    }
};