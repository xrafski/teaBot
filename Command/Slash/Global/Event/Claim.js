const { apiCall, errorResponseHandlerAPI } = require('../../../../Utilities/functions');
const logger = require('../../../../Utilities/logger');
const moment = require('moment');

module.exports = {
    name: 'claim',
    description: 'Claim codes from event code system.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [

        // Claim the code.
        {
            type: 3,
            name: 'code',
            description: 'Enter code to claim.',
            required: true
        },
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
            }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (1) Error to send reply', err));
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: true })
            .catch(err => logger.log('Command/Slash/Global/Event/Claim.js (2) Error to create interaction defer', err)); // Catch interaction reply error.


        // Call API to get required information about club certificate.
        apiCall('GET', `certificate/${guild.id}`, null, (err, certResponse) => {

            // Catch API error and move to error handler.
            if (err) {

                // Log API error event in the console.
                logger.log('Command/Slash/Global/Event/Claim.js (3) Error to get API response', err);

                // Send error message to the user.
                return interaction.editReply({
                    content: errorResponseHandlerAPI(err),
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (4) Error to send interaction defer reply', err));
            }

            // Check if guild is certified.
            if (!certResponse) {
                return interaction.editReply({ content: '> 🔒 This command is only available for registered members of Trove Ethics Alliance!' })
                    .catch(err => logger.log('Command/Slash/Global/Event/Claim.js (5) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
            }

            // If all good run claimTheCode function.
            else {
                claimTheCode();
            }
        });

        function claimTheCode() {

            // Data to insert with the API request.
            const data = {
                id: user.id,
                tag: user.tag
            };

            apiCall('patch', `code/claim/${interaction.guildId}/${args[0]}`, data, (err, res) => {

                // Catch API error and move to error handler.
                if (err) {

                    // Log API error event in the console.
                    logger.log('Command/Slash/Global/Event/Claim.js (6) Error to get API response', err);

                    // Send error message to the user.
                    return interaction.editReply({
                        content: errorResponseHandlerAPI(err)
                    }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (7) Error to send interaction defer reply', err));
                }

                // Switch to handle API response message.
                switch (res?.message) {

                    // Response when code is incorrect.
                    case 'code_invalid': {
                        // Send message to the user.
                        return interaction.editReply({
                            content: '🥶 This isn\'t a valid code.'
                        }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (8) Error to send interaction defer reply', err));
                    }

                    // Response when code is already claimed.
                    case 'code_claimed': {
                        // Send message to the user.
                        return interaction.editReply({
                            content: `🥶 This code (**${args[0]}**) is already claimed by <@${res.winner.id}> tag '${res.winner.tag}'!\n> ${moment.utc(res.updatedAt).format('Do MMMM YYYY [at] h:m a UTC')} (${moment.utc(res.updatedAt).fromNow()}).`
                        }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (9) Error to send interaction defer reply', err));
                    }

                    // Response when code is claimed by the user.
                    case 'claim_success': {
                        // Send message to the user.
                        return interaction.editReply({
                            content: `👑 Congratulations!\n You claimed the code **${res.document.code}**\nYour prize: **${res.document.prize}**.\n> __Contact server staff to receive your prize.__`
                        }).then(() => {

                            // Send public announcement.
                            return interaction.followUp({
                                content: `✨ ${user} looted **${res.document.prize}** from event code **${args[0]}**, GG!`,
                                ephemeral: false
                            }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (10) Error to send interaction followUp reply', err));

                        }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (11) Error to send interaction defer reply', err));
                    }

                    // Some default response.
                    default: {
                        // Send message to the user.
                        return interaction.editReply({
                            content: 'This command interation is not supported yet. Please try again later.'
                        }).catch(err => logger.log('Command/Slash/Global/Event/Claim.js (12) Error to send interaction defer reply', err));
                    }
                }
            });
        }
    }
};
