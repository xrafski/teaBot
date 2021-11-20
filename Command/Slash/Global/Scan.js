const { MessageEmbed, Permissions } = require('discord.js');
const moment = require('moment');
const { getEmote, apiCall } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');

module.exports = {
    name: 'scan',
    description: 'Scan the entire server to find threats.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [],

    async execute(client, interaction) {
        const { user, guild } = interaction;
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

        // Check if used is allowed to use this command (SERVER ADMIN).
        const gUser = guild.members.cache.get(user.id);
        if (!gUser?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {

            // Send interaction reply when user doesnt have permissions.
            return interaction.reply({ content: `> ${getEmote('locked')} ${user}, this command is only available for server admins!`, allowedMentions: { parse: [] } })
                .catch(err => logger.log('Command/Slash/Global/Scan.js (1) Error to send interaction reply', err)); // Catch interaction reply error.
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: false })
            .catch(err => logger.log('Command/Slash/Global/Scan.js (2) Error to send interaction defer reply', err)); // Catch interaction defer error.

        // Call an API endpoint to check certification.
        apiCall('GET', `certificate/${guild.id}`)
            .then(certResponse => {

                // Check if guild is certified.
                if (!certResponse) {
                    return interaction.editReply({ content: `> ${getEmote('locked')} This command is only available for registered members of Trove Ethics Alliance!` })
                        .catch(err => logger.log('Command/Slash/Global/Scan.js (3) Error to send interaction defer reply', err));
                }

                // Run threat check
                checkForThreats();

            })
            .catch(err => {
                logger.log('Command/Slash/Global/Scan.js (4) Error to get API response', err); // Log that event in the console.

                // Send interaction reply to front end about API error.
                interaction.editReply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                    .catch(err => logger.log('Command/Slash/Global/Scan.js (5) Error to send interaction defer reply', err)); // Catch interaction reply error.
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
            apiCall('GET', 'threat')
                .then(threatResponse => {

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
                                return interaction.editReply({ content: `> ${user} ${getEmote('danger')} Detected ${detectedThreats.length} threat(s) in **${guild.name}**.`, embeds: [scan_embed] })
                                    .catch(err => logger.log('Command/Slash/Global/Scan.js (6) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
                            } else {

                                // Send interaction defer reply wihout results.
                                return interaction.editReply({ content: `> ${getEmote('congratulation')} ${user}, There are no threats in this guild.` })
                                    .catch(err => logger.log('Command/Slash/Global/Scan.js (7) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
                            }
                        })
                        .catch(() => {

                            // Send interaction reply to front end about fetch error.
                            interaction.editReply({ content: `${getEmote('error')} Failed to fetch guild members.\n> Try again later ;(` })
                                .catch(err => logger.log('Command/Slash/Global/Scan.js (8) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
                        });
                })
                .catch(err => {
                    logger.log('Command/Slash/Global/Scan.js (9) Error to get API response', err); // Log that event in the console.
                    // Send interaction reply to front end about API error.
                    interaction.editReply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Slash/Global/Scan.js (10) Error to send interaction defer reply', err)); // Catch interaction reply error.
                });
        }
    }
};
