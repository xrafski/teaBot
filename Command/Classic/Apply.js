const { Permissions } = require('discord.js');
const { apiCall } = require('../../Utilities/functions');
const logger = require('../../Utilities/logger');

module.exports = {
    name: 'apply', // Command name.
    aliases: [], // Command aliases.
    description: 'Returns websocket connection ping.', // Command description.
    guild: [], // Specify guild to allow run this command.
    permissions: [], // Specify permissions to allow run this command.
    enabled: true, // Whether to enable this command.

    run: async (client, message) => {
        let clubNameVar; // Club Name ✅
        let clubLevelVar; // Level ✅
        let clubJoinworldVar; // Joinworld command ✅
        let clubDescriptionVar; // Cescription ✅
        let clubRequirementsVar; // Requirements ✅
        let clubRepresentativeVar; // Representative ✅
        let clubDiscordVar; // Discord invite code ✅
        let cRequesterVar; // Person who used this command ✅
        let varDiscordCountInt = 0; // Server member count ✅

        // Set variable with time to answer each question.
        const questionResponseTime = 1000 * 60 * 10; // 10 minutes

        // Allow to answer question only from command user.
        const filter = msg => msg.author.id === message.author.id;

        // Deconstruct object.
        const { guild, member, author, channel } = message;

        // Check if used is allowed to use this command (SERVER ADMIN).
        if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return message.reply({ content: `> ${author} This command is only available for server admins!`, allowedMentions: { parse: [] } })
                .catch(err => logger.log('Command/Classic/Apply.js (x) Error to send message reply', err));
        }

        // Check if guild has meet minimal member count requirements to join TEA.
        if (client.config.debug === false) { // Disable that if statement if debug is enabled.
            if (guild.memberCount < 100) {
                return message.reply({ content: `> Unfortunately ${author}, your discord server doesn't meet our minimal requirements (${guild.memberCount}/**100** members), try again later.`, allowedMentions: { parse: [] } })
                    .catch(err => logger.log('Command/Classic/Apply.js (x) Error to send message reply', err));
            }
        }

        // Check if guild is already registered.
        const clubCertificate = await apiCall('GET', `certificate/${guild.id}`)
            .catch(err => { // API call error handler.
                logger.log('Command/Classic/Apply.js (x) Error to get API response', err); // Log API error.

                // Send message to front end about the error.
                message.reply({ content: '❌ Failed to receive data from API.\n> Try again later ;(' })
                    .catch(err => logger.log('Command/Classic/Apply.js (x) Error to send message reply', err)); // Catch message reply error.
            });


        console.log('clubCertificate', clubCertificate); // Undefined if error;


        // varDiscordCountInt = guild.memberCount;
        // console.log(varDiscordCountInt);


    }
};
