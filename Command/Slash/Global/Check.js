const { MessageEmbed } = require('discord.js');
const { apiCall, getEmote, errorResponseHandlerAPI } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');


module.exports = {
    name: 'check',
    description: 'Check if a specific Trove Nickname or User Discord ID is flaged as a threat.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [
        {
            type: 'STRING',
            name: 'trove-discord-info',
            description: 'Nickname or User Discord ID. The more details, the more accurate results are.',
            required: true
        }
    ],

    async execute(client, interaction, args) {
        const { user, guild } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

        // Check if command used on direct message.
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: '> 🔒 This command is not available on direct message!',
                ephemeral: false,
            }).catch(err => logger.log('Command/Slash/Global/Check.js (1) Error to send reply', err));
        }

        // Check if arg is alphanumeric.
        if (/^[a-z0-9_ ]+$/i.test(args[0]) === false) {
            return interaction.reply({ content: '❌ Only alphanumeric characters are allowed.' })
                .catch(err => logger.log('Command/Slash/Global/Check.js (2) Error to send interaction reply', err)); // Catch interaction reply error.
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: false })
            .catch(err => logger.log('Command/Slash/Global/Check.js (3) Error to send interaction defer reply', err));

        // Call API to get required information about club certificate.
        apiCall('GET', `certificate/${guild.id}`, null, (err, certResponse) => {

            // Catch API error and move to error handler.
            if (err) {

                // Log API error event in the console.
                logger.log('Command/Slash/Global/Check.js (4) Error to get API response', err);

                // Send error message to the user.
                return interaction.editReply({
                    content: errorResponseHandlerAPI(err),
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Check.js (5) Error to send interaction defer reply', err));
            }

            // Check if guild is certified.
            if (!certResponse) {
                return interaction.editReply({ content: '> 🔒 This command is only available for registered members of Trove Ethics Alliance!' })
                    .catch(err => logger.log('Command/Slash/Global/Check.js (6) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
            }

            // Run another API call to get required data for threat user.
            apiCall('GET', `threat/${args[0]}`, null, (err, threatResponse) => {
                if (err) {
                    logger.log('Command/Slash/Global/Check.js (7) Error to get API response', err); // Log that event in the console.

                    // Send interaction reply to front end about API error.
                    return interaction.editReply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Slash/Global/Check.js (8) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
                }

                return formatDocument(threatResponse);
            });
        });

        /**
         * Format documment as a function to make it more readable.
         * @param {*} document mongoDB document
         * @returns interaction defer reply with formatted document.
         */
        async function formatDocument(document) {
            // Check if document is found.
            if (!document) {
                // Create discord embed element.
                const notFoundEmbed = new MessageEmbed()
                    .setDescription(`${getEmote('info')} This user is not detected as a threat in our database!`)
                    .setAuthor({ name: 'Trove Ethics Alliance - Results', iconURL: links.icon })
                    .setColor('#0095ff');

                // Return interaction reply with formatted response about user not found..
                return interaction.editReply({
                    embeds: [notFoundEmbed],
                    // components: [
                    //     {
                    //         type: 1,
                    //         components: [
                    //             {
                    //                 type: 2,
                    //                 url: links.formReport,
                    //                 label: 'If you think that user is a threat, please report here.',
                    //                 style: 5
                    //             }
                    //         ]
                    //     }
                    // ]
                })
                    .catch(err => logger.log('Command/Slash/Global/Check.js (9) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
            }

            const checkedIDs = await lookForThreat(document.discord);
            const resultEmbed = new MessageEmbed()
                .setColor(setThreatColor(document.warning))
                .setAuthor({ name: 'Trove Ethics Alliance', iconURL: links.icon })
                .setTitle(`Nickname: \`${document.name}\``)
                .setDescription(`**Reason:** ${document.reason}\n‏‏‎ ‎‎`)
                .addFields(
                    // { name: 'Discord User ID(s)', value: document.discord ? document.discord : 'Unknown', inline: false },
                    { name: 'Alternate account(s)', value: document.alternates ? document.alternates : 'No data about alternate accounts.', inline: false },
                    { name: 'Evidence(s)', value: document.evidence ? document.evidence : 'No evidence provided', inline: false },
                    { name: 'Additional notes', value: document.notes ? document.notes : 'No notes', inline: false },
                    { name: 'Server Scan', value: checkedIDs ? `The following threat account(s) have been identified on this server: ${checkedIDs}` : 'There is no associated member on this server.' }
                )
                .setThumbnail(links.logo)
                .setTimestamp()
                .setFooter({ text: 'Trove Ethics Alliance', iconURL: links.icon });

            // Send interaction reply about threat user with fommatted message.
            interaction.editReply({
                embeds: [resultEmbed],
                // components: [
                //     {
                //         type: 1,
                //         components: [
                //             {
                //                 type: 2,
                //                 url: links.formReport,
                //                 label: 'Report players here',
                //                 style: 5
                //             },
                //             {
                //                 type: 2,
                //                 url: links.formAppeal,
                //                 label: 'Appeal is available over here',
                //                 style: 5
                //             }
                //         ]
                //     }
                // ]
            })
                .catch(err => logger.log('Command/Slash/Global/Check.js (10) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
        }

        /**
         * Simple function to return color code provided by a letter or something idk.
         * @param {String} color Threat color (g, y, r, b)
         * @returns html color code for specified color code.
         */
        function setThreatColor(color) {
            switch (color) {
                case 'g': return '#45ff24'; // Green threat level.
                case 'y': return '#ffff24'; // Yellow threat level.
                case 'r': return '#ff1a1a'; // Red threat level.
                case 'b': return '#0f0f0f'; // Black threat level.
                default: return '#fcfcfc'; // Default threat level which is almost white (cant be entirely #fff due to discord might define this color as transparent)
            }
        }

        /**
         * Function to check guild members and try to match with provided document from MongoDB.
         * @param {Object} docDiscord data from document.discord.
         * @returns A string with formatted fetched guild mambers that has been matched.
         */
        async function lookForThreat(docDiscord) {
            const formatDiscordID = docDiscord?.replace(/[\\<>@#&?! ]/g, '').split(','); // Replace some symbols from document and split to make an array.

            const promises = []; // Promise array to deal later on.

            // All promises will be added to array
            for (let index = 0; index < formatDiscordID.length; index++) {
                const userID = formatDiscordID[index];
                promises.push(
                    guild.members.fetch(userID)
                        .then(member => {
                            return `\n> ${member?.user?.tag} (${member?.toString()})`;
                        })
                        .catch(() => { return; }) // Ignore error here because it's not important.
                );
            }

            // Promise.all will await all promises in the array to resolve
            // then it will itself resolve to an array of the results.
            // results will be in order of the Promises passed,
            // regardless of completion order
            const results = await Promise.all(promises);
            return results.filter(member => member !== undefined).join('');
        }
    }
};
