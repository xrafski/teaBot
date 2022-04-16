const { MessageEmbed, Permissions } = require('discord.js');
const moment = require('moment');
const { getEmote, apiCall, errorResponseHandlerAPI } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');

module.exports = {
    name: 'scan',
    description: 'Scan the entire server to find threats.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [],

    async execute(client, interaction) {
        const { user, guild, member } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

        // Check if command used on direct message.
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: '> 🔒 This command is not available on direct message!',
                ephemeral: false,
            }).catch(err => logger.log('Command/Slash/Global/Scan.js (1) Error to send reply', err));
        }

        // Check if user is allowed to use this command (ADMIN).
        if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({
                content: '> 🔒 This command is only available for server admins!',
                ephemeral: true,
            }).catch(err => logger.log('Command/Slash/Global/Scan.js (2) Error to send reply', err));
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: false })
            .catch(err => logger.log('Command/Slash/Global/Scan.js (3) Error to send interaction defer reply', err)); // Catch interaction defer error.

        // Call an API endpoint to check certification.
        apiCall('GET', `certificate/${guild.id}`, null, (err, certResponse) => {

            // Catch API error and move to error handler.
            if (err) {

                // Log API error event in the console.
                logger.log('Command/Slash/Global/Scan.js (4) Error to get API response', err);

                // Send error message to the user.
                return interaction.editReply({
                    content: errorResponseHandlerAPI(err),
                    ephemeral: true
                }).catch(err => logger.log('Command/Slash/Global/Scan.js (5) Error to send interaction defer reply', err));
            }

            // Check if guild is certified.
            if (!certResponse) {
                return interaction.editReply({ content: '> 🔒 This command is only available for registered members of Trove Ethics Alliance!' })
                    .catch(err => logger.log('Command/Slash/Global/Scan.js (6) Error to send interaction defer reply', err));
            }

            // Run threat check
            else {
                return checkForThreats();
            }
        });

        function formatThreats(array) {
            let threatString = '';
            array.forEach(threat => {
                threatString += `\n> ${warningEmoji(threat.warning)} \`${threat.name}\``;
            });

            // Return a string representation.
            if (!threatString) return `${getEmote('congratulation')} There are no threats in this guild.`;
            else return threatString;
        }

        function warningEmoji(userWarning) {
            switch (userWarning) {
                case 'g': return '🟢';
                case 'y': return '🟡';
                case 'r': return '🔴';
                case 'b': return '💀';
                default: return '⚪';
            }
        }

        function checkForThreats() {

            // Call an API endpoint to get threat list.
            apiCall('GET', 'threat', null, (err, threatResponse) => {
                if (err) {
                    logger.log('Command/Slash/Global/Scan.js (7) Error to get API response', err); // Log that event in the console.

                    // Send interaction reply to front end about API error.
                    return interaction.editReply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Slash/Global/Scan.js (8) Error to send interaction defer reply', err)); // Catch interaction reply error.
                }

                // Fetch all members from a guild
                guild.members.fetch()
                    .then(fetchedGuild => {

                        // Assing threat list array.
                        const detectedThreats = [];

                        // Make an array with member IDs.
                        const memberList = [...fetchedGuild.keys()];

                        // Go via each threat and check if there is any guild member with that ID.
                        threatResponse.forEach(threat => {

                            // Check if threat is in the guild member list and push it onto the array if it is.
                            if (memberList.some(i => threat.discord?.includes(i))) {
                                detectedThreats.push(threat);
                            }
                        });

                        // Create embed message.
                        const scan_embed = new MessageEmbed()
                            .setColor('#0095ff')
                            .setAuthor('Trove Ethics Alliance Scan', links.icon)
                            .setDescription(`${formatThreats(detectedThreats)}`)
                            .setFooter(`Trove Ethics Alliance | ${moment(Date.now()).utc().format('Do MMM YYYY @ hh:mm A z')}`, links.icon)
                            .setThumbnail(links.logo);

                        // Send a interaction defer reply according to the results.
                        if (detectedThreats.length > 0) {

                            // Send interaction defer reply with results.
                            return interaction.editReply({ content: `> ${user} ${getEmote('danger')} Detected **${detectedThreats.length}** threat(s) in **${guild.name}**.\n${getEmote('info')} You can use **/check** to see a specific threat details.`, embeds: [scan_embed] })
                                .catch(err => logger.log('Command/Slash/Global/Scan.js (9) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
                        } else {

                            // Send interaction defer reply wihout results.
                            return interaction.editReply({ content: `> ${getEmote('congratulation')} ${user}, There are no threats in this guild.` })
                                .catch(err => logger.log('Command/Slash/Global/Scan.js (10) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
                        }
                    })
                    .catch(() => {

                        // Send interaction reply to front end about fetch error.
                        interaction.editReply({ content: `${getEmote('error')} Failed to fetch guild members.\n> Try again later ;(` })
                            .catch(err => logger.log('Command/Slash/Global/Scan.js (11) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
                    });

            });
        }
    }
};
