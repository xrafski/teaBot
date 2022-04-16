const { apiCall, errorResponseHandlerAPI } = require('../../../../Utilities/functions');
const logger = require('../../../../Utilities/logger');

module.exports = {
    name: 'remaining',
    description: 'List remaining hints that are available to claim.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [
    ],

    async execute(client, interaction) {
        const { user, guild } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

        // Check if command used on direct message.
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: '> 🔒 This command is not available on direct message!',
                ephemeral: false,
            }).catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (1) Error to send reply', err));
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: true })
            .catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (2) Error to create interaction defer', err)); // Catch interaction reply error.


        // Call API to get required information about club certificate.
        apiCall('GET', `certificate/${guild.id}`, null, (err, certResponse) => {
            // Catch API error and move to error handler.
            if (err) {

                // Log API error event in the console.
                logger.log('Command/Slash/Global/Event/Remaining.js (3) Error to get API response', err);

                // Send error message to the user.
                return interaction.editReply({
                    content: errorResponseHandlerAPI(err),
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (4) Error to send interaction defer reply', err));
            }

            // Check if guild is certified.
            if (!certResponse) {
                return interaction.editReply({ content: '> 🔒 This command is only available for registered members of Trove Ethics Alliance!' })
                    .catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (5) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
            }

            // If all good run checkRemainingCodes function.
            else {
                checkRemainingCodes();
            }
        });

        function checkRemainingCodes() {

            // Array with emojis.
            const emoArr = ['📥', '📤'];

            // Call API to get required information about remaining codes.
            return apiCall('GET', `code/list/remaining/${interaction.guildId}`, null, (err, res) => {

                // Catch API error and move to error handler.
                if (err) {

                    // Log API error event in the console.
                    logger.log('Command/Slash/Global/Event/Remaining.js (6) Error to get API response', err);

                    // Send error message to the user.
                    return interaction.editReply({
                        content: errorResponseHandlerAPI(err)
                    }).catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (7) Error to send interaction defer reply', err));
                }

                // Response when there are no codes.
                if (!res.length) {
                    return interaction.editReply({
                        content: '> 🥶 There are no codes to claim.'
                    }).catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (8) Error to send interaction defer reply', err));
                }

                // Response with list of hints of codes to claim.
                return interaction.editReply({
                    content: '> __**Check out the list below!**__ 👇'
                }).then(async () => {

                    const claimedCodes = [];
                    const unclaimedCodes = [];
                    let secretCodesInt = 0;
                    let claimedCodesInt = 0;

                    // res.map(code => code.claimed ? claimedCodes.push(`~~${emoArr[1]} '${code.code}' claimed by <@${code.winner.id}>~~`) : unclaimedCodes.push(code.hint ? `${emoArr[0]} ${code.hint}` : null));
                    res.map(code => {

                        // Push claimed codes to array.
                        if (code.claimed) {
                            claimedCodes.push(`\n~~${emoArr[1]} '${code.code}' claimed by <@${code.winner.id}>~~`);
                            return claimedCodesInt++;
                        }

                        // Push unclaimed codes with hints to array.
                        if (code.hint) {
                            unclaimedCodes.push(`\n${emoArr[0]} ${code.hint}`);
                        }

                        // Else increase secret codes counter.
                        else {
                            secretCodesInt++;
                        }

                    });

                    // Create a string with the list of hints and users that claimed codes.
                    // const listString = `> ${user} • ${claimedCodesNum} of **${res.length}** codes has been claimed.${unclaimedCodes[0] ? `\n\n${unclaimedCodes.join('\n')}` : ''}${claimedCodes[0] ? `\n\n> **CLAIMED CODES**\n${claimedCodes.join('\n')}` : ''}${secretCodes ? `\n\n> 🔐 **${secretCodes}** SECRET CODE(S)` : ''}`;
                    const listString = `> ${user} • ${claimedCodesInt} of **${res.length}** codes has been claimed.${unclaimedCodes[0] ? unclaimedCodes.join('') : ''}${claimedCodes[0] ? `\n\n> **CLAIMED CODES**${claimedCodes.join('')}` : ''}${secretCodesInt ? `\n\n🔐 **${secretCodesInt}** SECRET CODE(S)!` : ''}`;

                    // Send a public followUp mesage.
                    interaction.followUp({
                        content: listString.substring(0, 2000) // Substring to make sure message content never exceed 2000 characters.
                    }).catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (9) Error to send interaction followUp reply', err));

                }).catch(err => logger.log('Command/Slash/Global/Event/Remaining.js (10) Error to send interaction defer reply', err));
            });
        }
    }
};
